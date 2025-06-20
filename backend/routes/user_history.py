from flask import Blueprint, request, jsonify, current_app
from pymongo import MongoClient
import jwt
import datetime
from functools import wraps
import os
from bson import ObjectId
from bson.errors import InvalidId  # ✅ Import for safe ObjectId handling

user_history = Blueprint('user_history', __name__)

# MongoDB Setup
client = MongoClient(os.getenv("MONGO_URL"))
db = client["users"]
users_collection = db["register"]
activity_collection = db["activity_history"]

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

@user_history.route('/user/history', methods=['GET'])
@token_required
def get_user_history(current_user):
    try:
        user_object_id = current_user["_id"]  # Already an ObjectId

        # Query using ObjectId not string
        activities_cursor = activity_collection.find(
            {"user_id": user_object_id}
        ).sort("timestamp", -1)

        activity_data = []

        for activity in activities_cursor:
            timestamp = activity.get("timestamp")

            if isinstance(timestamp, datetime.datetime):
                timestamp_ms = int(timestamp.timestamp() * 1000)
            else:
                timestamp_ms = int(timestamp)

            activity_data.append({
                "action": activity.get("action", ""),
                "timestamp": timestamp_ms,
                "details": activity.get("details", "")
            })

        return jsonify({"history": activity_data}), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching user history: {e}")
        return jsonify({"message": "Internal server error!"}), 500
