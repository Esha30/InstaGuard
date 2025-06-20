from flask import Blueprint, request, jsonify, current_app
from pymongo import MongoClient
import jwt
import requests
from datetime import datetime, timedelta
from functools import wraps
import os
from bson import ObjectId
from bson.errors import InvalidId

google_signin_bp = Blueprint('google_signin', __name__)

# MongoDB Setup
client = MongoClient(os.getenv("MONGO_URL"))
db = client["users"]
users_collection = db["register"]
activity_collection = db["activity_history"]

# Secret key for JWT
SECRET_KEY = os.getenv("SECRET_KEY")
RECAPTCHA_SECRET = os.getenv("RECAPTCHA_SECRET_KEY")


# Optional: Dummy reCAPTCHA check if not defined elsewhere
def verify_recaptcha(token):
    try:
        response = requests.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={"secret": RECAPTCHA_SECRET, "response": token}
        )
        return response.json().get("success", False)
    except Exception as e:
        current_app.logger.error(f"reCAPTCHA verification failed: {e}")
        return False


# JWT token verification decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', None)
        if not token:
            return jsonify({"message": "Missing token"}), 401

        try:
            token = token.split()[1]  # Extract token after "Bearer"
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = data["user_id"]

            try:
                user_object_id = ObjectId(user_id)
            except InvalidId:
                current_app.logger.error("Invalid ObjectId in JWT token")
                return jsonify({"message": "Token is invalid"}), 401

            current_user = users_collection.find_one({"_id": user_object_id})
            if not current_user:
                current_app.logger.error(f"User with ID {user_id} not found.")
                return jsonify({"message": "User not found"}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError as e:
            current_app.logger.error(f"JWT decode error: {e}")
            return jsonify({"message": "Invalid token"}), 401
        except Exception as e:
            current_app.logger.error(f"Unexpected error in token validation: {e}")
            return jsonify({"message": "Token is invalid"}), 401

        return f(current_user, *args, **kwargs)
    return decorated


@google_signin_bp.route('/google-signin', methods=['POST'])
def handle_google_signin():
    try:
        data = request.get_json() or {}
        id_token = data.get('id_token')
        captcha_response = data.get('captcha')

        if captcha_response and not verify_recaptcha(captcha_response):
            return jsonify({"message": "Invalid CAPTCHA. Please try again."}), 400

        if not id_token:
            return jsonify({"message": "Missing Google id_token"}), 400

        # Verify Google token
        google_verify = requests.get('https://oauth2.googleapis.com/tokeninfo', params={'id_token': id_token})
        if google_verify.status_code != 200:
            return jsonify({"message": "Invalid Google token"}), 401

        info = google_verify.json()
        email = info.get('email')
        fullname = info.get('name')

        if not email:
            return jsonify({"message": "Google token missing email"}), 400

        # Check if user exists
        user = users_collection.find_one({'email': email})
        is_new_user = False

        if not user:
            # Create new user
            user_doc = {
                "fullname": fullname,
                "email": email,
                "password": "",
                "mobile": "",
                "isVerified": True,
                "verification_token": None,
                "verification_token_expiry": None,
                "role": "user",
                "createdAt": datetime.utcnow(),
                "last_login": datetime.utcnow(),
                "refresh_token": ""
            }
            result = users_collection.insert_one(user_doc)
            user = users_collection.find_one({"_id": result.inserted_id})
            is_new_user = True
        else:
            # Update last login timestamp
            users_collection.update_one({"_id": user["_id"]}, {"$set": {"last_login": datetime.utcnow()}})

        # Create JWT tokens
        access_token = jwt.encode({
            'user_id': str(user["_id"]),
            'email': user.get("email", ""),
            'role': user.get("role", "user"),
            'exp': datetime.utcnow() + timedelta(days=7)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        refresh_token = jwt.encode({
            'user_id': str(user["_id"]),
            'email': user.get("email", ""),
            'exp': datetime.utcnow() + timedelta(days=30)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"refresh_token": refresh_token}}
        )

        # ✅ Log Google sign-in activity
        activity_collection.insert_one({
            "user_id": user["_id"],
            "action": "Google Sign-In",
            "timestamp": int(datetime.utcnow().timestamp() * 1000),  # Store as ms
            "details": f"{fullname} Logged in using Google OAuth."
        })

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token
        }), 200

    except Exception as e:
        current_app.logger.exception("Google Sign-in error:")
        return jsonify({"message": "Internal server error!"}), 500

