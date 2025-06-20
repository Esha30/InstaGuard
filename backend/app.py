import requests
from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
import bcrypt
from pymongo import MongoClient
from werkzeug.exceptions import BadRequest
from dotenv import load_dotenv
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import uuid
from datetime import datetime, timedelta
import logging
import jwt
from joblib import load
import traceback  # Add this at the top
from bson import ObjectId
from functools import wraps
from routes.predict import predict_bp
from routes.user_profile import user_profile
from routes.admin_profile import admin_profile
from routes.real_accounts import REAL_BLOCKED_ACCOUNTS 
from routes.user_history import user_history
from routes.auth import token_required
from routes.user_info import user_info
from routes.google_signin import google_signin_bp
from routes.contact import contact_bp
from routes.admin_analytics import admin_analytics_bp
import joblib
import numpy as np
import pandas as pd  # ✅ this fixes the 'pd not defined' error
from routes.report import report_bp
from routes.my_reports import my_reports_bp
from routes.admin_reports import admin_reports_bp
from routes.admin_settings import admin_settings_bp
from routes.feedback import feedback_bp
# === Setup Logging ===
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# === Load Environment Variables ===
load_dotenv()

app = Flask(__name__)
# Update the CORS setup in your Flask app


CORS(app, resources={r"/*": {"origins": "http://localhost:3000", "methods": ["GET", "POST", "DELETE", "PUT"]}},
     supports_credentials=True, allow_headers=["Content-Type", "Authorization"])

# === Secret Key for JWT ===
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "dev_secret_key")  # fallback for dev
app.config['JWT_SECRET_KEY']=os.getenv("JWT_SECRET_KEY")

# === MongoDB Setup ===
client = MongoClient(os.getenv("MONGO_URL"))
db = client["users"]
users_collection = db["register"]
activity_collection = db["activity_history"]  # This will create the collection automatically if it doesn't exist

# === Email Config ===
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

# === reCAPTCHA Secret ===
RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")

rapid_api_key = os.getenv("RAPID_API_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")



def log_activity(user_id, action, details):
    activity_collection.insert_one({
        "user_id": user_id,
        "action": action,
        "timestamp": datetime.utcnow(),
        "details": details
    })


def verify_jwt(token):
    try:
        decoded = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
        return decoded
    except jwt.InvalidTokenError:
        return None

def verify_recaptcha(captcha_response):
    try:
        verification_url = 'https://www.google.com/recaptcha/api/siteverify'
        payload = {'secret': RECAPTCHA_SECRET_KEY, 'response': captcha_response}
        response = requests.post(verification_url, data=payload)
        result = response.json()
        return result.get('success', False)
    except Exception as e:
        logger.error(f"CAPTCHA verification failed: {e}")
        return False

def generate_verification_token():
    return str(uuid.uuid4())

def verify_token(token):
    user = users_collection.find_one({"verification_token": token})
    if not user:
        return None
    token_expiry = user.get('verification_token_expiry')
    if not isinstance(token_expiry, datetime):
        token_expiry = datetime.strptime(token_expiry, "%Y-%m-%dT%H:%M:%S.%f")
    if datetime.utcnow() > token_expiry:
        return None
    return user

def verify_user(user):
    result = users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"isVerified": True},
            "$unset": {"verification_token": "", "verification_token_expiry": ""}
        }
    )
    return result.modified_count > 0


def email_is_valid(email):
    return re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email)

def send_verification_email(to_email, token):
    try:
        verify_url = f"http://localhost:5000/verify-email/{token}"
        subject = "Verify your email - InstaGuard"
        html_content = f"""
        <html>
        <body>
            <h3>Hello!</h3>
            <p>Thanks for registering on <b>InstaGuard</b>.</p>
            <p>Please click the button below to verify your email:</p>
            <a href="{verify_url}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none;">Verify Email</a>
            <p>If you didn’t create this account, please ignore this email.</p>
        </body>
        </html>
        """

        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_USER, EMAIL_PASS)
            smtp.send_message(msg)
            logger.info("Verification email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send verification email: {str(e)}")

# === Routes ===

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        captcha_response = data.get('captcha')

        if not captcha_response or not verify_recaptcha(captcha_response):
            return jsonify({"message": "Invalid CAPTCHA. Please try again."}), 400

        fullname = data.get('fullname', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirmPassword = data.get('confirmPassword', '')
        mobile = data.get('mobile', '').strip()

        if not all([fullname, email, password, confirmPassword, mobile]):
            return jsonify({"message": "Please fill in all the required fields!"}), 400

        if password != confirmPassword:
            return jsonify({"message": "Passwords do not match!"}), 400

        if not email_is_valid(email):
            return jsonify({"message": "Invalid email format!"}), 400

        if users_collection.find_one({"email": email}):
            return jsonify({"message": "Email already registered!"}), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        full_mobile_number = mobile
        verification_token = generate_verification_token()
        token_expiry = datetime.utcnow() + timedelta(hours=1)

        user = {
            "fullname": fullname,
            "email": email,
            "password": hashed_password,
            "mobile": full_mobile_number,
            "isVerified": False,
            "verification_token": verification_token,
            "verification_token_expiry": token_expiry,
            "role": "user",
            "createdAt": datetime.utcnow(),  # <-- Add this line
            "last_login": None  # <-- Add last_login field (null initially)
        }

        result = users_collection.insert_one(user)
        new_user_id = result.inserted_id  # Capture the inserted user's ObjectId

# Send verification email
        send_verification_email(email, verification_token)

# Log signup activity
        activity_collection.insert_one({
    "user_id": new_user_id,
    "action": "Signed up",
    "timestamp": datetime.utcnow(),
    "details": f"Welcome {fullname}, your account was created successfully."
})


        return jsonify({"message": "Signup successful! Please check your email to verify your account."}), 201

    except BadRequest as e:
        return jsonify({"message": f"Bad request: {str(e)}"}), 400
    except Exception as e:
        logger.error(f"Signup error: {e}")
        return jsonify({"message": "Internal server error!"}), 500

@app.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    user = verify_token(token)
    if not user:
        return jsonify({"message": "Invalid or expired token!"}), 400

    if verify_user(user):
        return jsonify({"message": "Email verified successfully!"}), 200
    else:
        return jsonify({"message": "Failed to verify user!"}), 400

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        captcha_response = data.get('captcha')

        if not captcha_response or not verify_recaptcha(captcha_response):
            return jsonify({"message": "Invalid CAPTCHA. Please try again."}), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({"message": "Email and Password are required!"}), 400

        user = users_collection.find_one({"email": email})

        if not user:
            return jsonify({"message": "User not found!"}), 404

        if not user.get("isVerified"):
            return jsonify({"message": "Please verify your email first!"}), 403

        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({"message": "Invalid password!"}), 401

        token = jwt.encode({
            'user_id': str(user['_id']),
            'email': email,
            'role': user['role'],
            'exp': datetime.utcnow() + timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        # Assuming 'user' is the current user obtained after token verification
        # Update last login time
        users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )

        # Log login activity in activity_history collection
        activity_collection.insert_one({
            "user_id": user["_id"],  # Add the user_id of the logged-in user
            "action": "Logged in",
            "timestamp": datetime.utcnow(),  # Store the current UTC time
            "details": "You logged in recently."
        })

        return jsonify({
            "message": "Login successful!",
            "token": token,
            "role": user['role']
        }), 200

    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({"message": "Internal server error!"}), 500

@app.route('/send-otp', methods=['POST', 'OPTIONS'])
def send_otp():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'Preflight check successful'})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        return response, 200

    try:
        data = request.get_json()
        mobile = data.get("mobile")

        if not mobile:
            return jsonify({"message": "Mobile number required!"}), 400

        logger.info(f"OTP sent to {mobile}")
        return jsonify({"message": f"OTP sent to {mobile}"}), 200

    except Exception as e:
        logger.error(f"OTP send error: {e}")
        return jsonify({"message": "Failed to send OTP"}), 500
    
@app.route('/protected-route', methods=['GET'])
@token_required
def protected_route(current_user):
    try:
        # JWT token from request headers
        token = request.headers.get('Authorization').split(" ")[1]
        try:
            # Decode the token
            decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            exp_timestamp = decoded.get("exp")

            if exp_timestamp:
                expiration_time = datetime.utcfromtimestamp(exp_timestamp)
                if expiration_time < datetime.utcnow():
                    return jsonify({"message": "Token expired!"}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token!"}), 401
        
        return jsonify({"message": "Protected route accessed", "user": current_user}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500
    

    
@app.route('/api/get-all-users', methods=['GET'])
def get_all_users():
    try:
        # Check for authorization token in the header
        token = request.headers.get('Authorization')  # Ensure the token is in the header
        if not token:
            return jsonify({"message": "Authorization token is missing!"}), 400
        
        token = token.replace("Bearer ", "")  # Remove the "Bearer " prefix if present
        
        # Decode the token to check if the user is authorized
        try:
            decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            email = decoded['email']
            role = decoded.get('role', 'user')

            # Check if the user has admin privileges to access all users data
            if role != "admin":
                return jsonify({"message": "Permission denied! Admin access required."}), 403

            # Query MongoDB for users with role 'user'
            users = users_collection.find({"role": "user"}, {"password": 0})  # Exclude the password field from the response
            users_list = []
            for user in users:
                user["_id"] = str(user["_id"])  # Convert ObjectId to string
                # Include _id in the response so frontend can access it
                user_info = {
                    "_id": user["_id"],  # Include _id field
                    "fullname": user.get("fullname"),
                    "email": user.get("email"),
                    "mobile": user.get("mobile"),
                    "role": user.get("role"),
                    "isVerified": user.get("isVerified"),
                }
                users_list.append(user_info)

            return jsonify({"users": users_list}), 200

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token!"}), 401

    except Exception as e:
        logger.error(f"Error fetching all users: {e}")
        return jsonify({"message": "Failed to fetch users!"}), 500


@app.route('/api/admin/users', methods=['GET'])
def get_users():
    try:
        # Check for authorization token in the header
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"message": "Authorization token is missing!"}), 400

        token = token.replace("Bearer ", "")  # Remove the "Bearer " prefix if present
        
        # Decode the token to check if the user is authorized
        try:
            decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            email = decoded['email']
            role = decoded.get('role', 'user')

            # Check if the user has admin privileges to access all users data
            if role != "admin":
                return jsonify({"message": "Permission denied! Admin access required."}), 403

            # Query MongoDB for users with role 'user'
            users = users_collection.find({"role": "user"}, {"password": 0})  # Exclude the password field from the response
            users_list = []
            for user in users:
                user["_id"] = str(user["_id"])  # ✅ convert ObjectId to string

                user_info = {
                    "fullname": user.get("fullname"),
                    "email": user.get("email"),
                    "mobile": user.get("mobile"),
                    "role": user.get("role"),
                    "isVerified": user.get("isVerified"),
                }
                users_list.append(user_info)

            return jsonify({"users": users_list}), 200

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token!"}), 401

    except Exception as e:
        logger.error(f"Error fetching user profiles: {e}")
        return jsonify({"message": "Failed to fetch user profiles!"}), 500

    except Exception as e:
        logger.error(f"Error fetching user profiles: {e}")
        return jsonify({"message": "Failed to fetch user profiles!"}), 500

@app.route('/api/delete-user/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        # Decode JWT token from the Authorization header
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"message": "Authorization token is missing!"}), 400
        
        token = token.replace("Bearer ", "")  # Remove the "Bearer " prefix
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        role = decoded.get('role')

        if role != "admin":
            return jsonify({"message": "Permission denied! Admin access required."}), 403

        # 🗑️ Delete the user from the database
        result = users_collection.delete_one({"_id": ObjectId(user_id)})

        if result.deleted_count == 0:
            return jsonify({"message": "User not found!"}), 404

        return jsonify({"message": "User deleted successfully!"}), 200

    except Exception as e:
        return jsonify({"message": f"Error deleting user: {str(e)}"}), 500


# Ensure that the OPTIONS preflight request is handled properly
@app.route('/api/delete-user/<user_id>', methods=['OPTIONS'])
def options_handler(user_id):
    return '', 200  # Respond with status code 200 for OPTIONS
  

app.register_blueprint(admin_profile)


app.register_blueprint(user_profile)

app.register_blueprint(user_history)

app.register_blueprint(user_info)

app.register_blueprint(google_signin_bp)

app.register_blueprint(contact_bp)

app.register_blueprint(report_bp)

app.register_blueprint(my_reports_bp)

app.register_blueprint(admin_reports_bp)

app.register_blueprint(admin_analytics_bp)

app.register_blueprint(admin_settings_bp)

app.register_blueprint(feedback_bp)

app.register_blueprint(predict_bp)
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
