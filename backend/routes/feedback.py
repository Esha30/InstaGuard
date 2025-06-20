from flask import Blueprint, request, jsonify, current_app
from pymongo import MongoClient, DESCENDING
import jwt
import datetime
from functools import wraps
import os
from bson import ObjectId
from bson.errors import InvalidId

# Blueprint setup
feedback_bp = Blueprint("feedback", __name__)

# MongoDB setup
client = MongoClient(os.getenv("MONGO_URL", "mongodb://localhost:27017/"))
db = client["users"]
feedback_collection = db["feedback"]
users_collection = db["register"]

# Secret key
SECRET_KEY = os.getenv("SECRET_KEY")

# JWT token verification and return current_user
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", None)
        if not auth_header or not auth_header.startswith("Bearer "):
            current_app.logger.warning("Missing or malformed Authorization header")
            return jsonify({"message": "Missing or malformed token"}), 401

        token = auth_header.split(" ")[1]

        try:
            # Decode JWT token
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = data.get("user_id")

            if not user_id:
                current_app.logger.warning("Token missing user_id claim")
                return jsonify({"message": "Invalid token structure"}), 401

            try:
                user_object_id = ObjectId(user_id)
            except InvalidId:
                current_app.logger.warning(f"Invalid user_id in token: {user_id}")
                return jsonify({"message": "Invalid token format"}), 401

            current_user = users_collection.find_one({"_id": user_object_id})
            if not current_user:
                current_app.logger.warning(f"No user found with ID: {user_id}")
                return jsonify({"message": "User not found"}), 401

            return f(current_user, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            current_app.logger.warning("JWT token expired")
            return jsonify({"message": "Token expired"}), 401
        except jwt.DecodeError:
            current_app.logger.warning("Error decoding JWT token")
            return jsonify({"message": "Malformed or invalid token"}), 401
        except jwt.InvalidTokenError as e:
            current_app.logger.warning(f"Invalid token error: {str(e)}")
            return jsonify({"message": "Invalid token"}), 401
        except Exception as e:
            current_app.logger.error(f"Unexpected token verification error: {str(e)}")
            return jsonify({"message": "Token verification failed"}), 401

    return decorated

# Public route: Submit feedback
@feedback_bp.route('/feedback', methods=['POST'])
@token_required
def submit_feedback(current_user):
    data = request.get_json()
    impression = data.get('impression')
    feedback = data.get('feedback')

    if not impression:
        return jsonify({'error': 'Impression is required'}), 400

    feedback_entry = {
        "user_id": current_user['_id'],
        "email": current_user.get("email", ""),          # ✅ Store email
        "username": current_user.get("fullname", ""),     # ✅ Store full name
        "impression": impression,
        "feedback": feedback or "",
        "timestamp": datetime.datetime.utcnow()
    }

    feedback_collection.insert_one(feedback_entry)
    return jsonify({'message': 'Feedback submitted successfully'}), 200


# Admin route: View all feedback
@feedback_bp.route('/api/admin/feedback', methods=['GET'])
@token_required
def get_all_feedback(current_user):
    try:
        role = current_user.get("role", "").lower()
        if role != "admin":
            current_app.logger.warning(f"Unauthorized access attempt by user: {current_user.get('email')}")
            return jsonify({'error': 'Unauthorized. Please log in as admin.'}), 403

        feedbacks = list(feedback_collection.find().sort("timestamp", DESCENDING))

        for fb in feedbacks:
            fb.pop("username", None)  # ✅ Remove 'username' field from each feedback
            fb["_id"] = str(fb["_id"])
            if "user_id" in fb:
                fb["user_id"] = str(fb["user_id"])
            if isinstance(fb.get("timestamp"), datetime.datetime):
                fb["timestamp"] = fb["timestamp"].isoformat()

        return jsonify({"feedback": feedbacks}), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching feedback: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


# Public route: Get feedback without token
@feedback_bp.route('/api/public/feedback', methods=['GET'])
def get_public_feedback():
    try:
        feedbacks = list(feedback_collection.find().sort("timestamp", DESCENDING))

        public_feedbacks = []
        for fb in feedbacks:
            public_feedbacks.append({
                "feedback": fb.get("feedback", ""),
                "impression": fb.get("impression", ""),
                "timestamp": fb.get("timestamp").isoformat() if fb.get("timestamp") else "",
                "email": fb.get("email", "anonymous@instaguard.ai"),
                "username": fb.get("username", "User")
            })

        return jsonify({"feedback": public_feedbacks}), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching public feedback: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

