# routes/admin/profile.py
from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
from pymongo import MongoClient
import jwt
import os
import logging
from datetime import datetime
from bson.errors import InvalidId  # ✅ Import for safe ObjectId handling
from functools import wraps


# Blueprint Setup
user_info = Blueprint("user_info", __name__)

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URL"))
db = client["users"]
users_collection = db["register"]

# Secret Key
SECRET_KEY = os.getenv("SECRET_KEY")

# Logger setup
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
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

            # ✅ Convert to ObjectId safely
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


@user_info.route('/api/user-info', methods=['GET'])
def get_user_info():
    try:
        # Step 1: Get token from Authorization header
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"message": "Authorization token is missing!"}), 400

        token = token.replace("Bearer ", "")
        logger.info(f"Received token: {token}")

        # Step 2: Decode the JWT token
        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            logger.info(f"Decoded token: {decoded}")
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired!")
            return jsonify({"message": "Token expired!"}), 401
        except jwt.InvalidTokenError:
            logger.warning("Invalid token!")
            return jsonify({"message": "Invalid token!"}), 401

        # Step 3: Get user_id from decoded token and fetch user from DB
        user_id = decoded.get("user_id")
        if not user_id:
            return jsonify({"message": "Invalid token payload!"}), 401

        try:
            user = users_collection.find_one({"_id": ObjectId(user_id)})
        except Exception as e:
            logger.error(f"Error converting to ObjectId: {e}")
            return jsonify({"message": "Invalid user ID!"}), 400

        if not user:
            return jsonify({"message": "User not found!"}), 404

        # Step 4: Return user info from the database
        user_info = {
            "fullname": user.get("fullname", ""),
            "email": user.get("email", ""),
            "role": user.get("role", "user")
        }

        return jsonify(user_info), 200

    except Exception as e:
        logger.error(f"Error fetching user info: {e}")
        return jsonify({"message": "Failed to fetch user info!"}), 500
