from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import jwt
import datetime
import requests
from functools import wraps
import os
from bson import ObjectId
import bcrypt

user_profile = Blueprint('user_profile', __name__)

# MongoDB Setup
client = MongoClient(os.getenv("MONGO_URL"))
db = client["users"]
users_collection = db["register"]
activity_collection = db["activity_history"]  # Add reference to activity collection

# Secret key for JWT
SECRET_KEY = os.getenv("SECRET_KEY")
RECAPTCHA_SECRET = os.getenv("RECAPTCHA_SECRET_KEY")

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
            current_user = users_collection.find_one({"_id": ObjectId(data["user_id"])})

            if not current_user:
                raise Exception("User not found")
        except Exception as e:
            print("JWT error:", e)
            return jsonify({"message": "Token is invalid"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# -------- GET PROFILE ----------
@user_profile.route('/user/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        "fullname": current_user.get("fullname", ""),
        "email": current_user.get("email", "")
    }), 200

# -------- UPDATE PROFILE ----------
@user_profile.route('/user/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    fullname = data.get("fullname")
    new_password = data.get("password")
    captcha = data.get("captcha")

    if not captcha:
        return jsonify({"message": "CAPTCHA is required"}), 400

    # Validate reCAPTCHA
    verify_response = requests.post(
        'https://www.google.com/recaptcha/api/siteverify',
        data={
            'secret': RECAPTCHA_SECRET,
            'response': captcha
        }
    )
    result = verify_response.json()
    if not result.get("success"):
        return jsonify({"message": "CAPTCHA verification failed"}), 400

    update_data = {}

    # Only add fullname to update if it's provided
    if fullname and fullname.strip() != current_user.get("fullname"):
        update_data["fullname"] = fullname.strip()

    # Only update password if it's provided
    if new_password:
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        update_data["password"] = hashed_password

    # If there is any update data, add the updatedAt field and perform the update
    if update_data:
        update_data["updatedAt"] = datetime.datetime.utcnow()
        users_collection.update_one({"_id": current_user["_id"]}, {"$set": update_data})

        # Log profile update activity
        activity_collection.insert_one({
            "user_id": current_user["_id"],
            "action": "Profile updated",
            "timestamp": datetime.datetime.utcnow(),
            "details": f"You updated  your profile."
        })

    return jsonify({"message": "Profile updated successfully."}), 200
