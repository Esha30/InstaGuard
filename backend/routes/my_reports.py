from flask import Blueprint, request, jsonify, current_app
from pymongo import MongoClient, DESCENDING
import jwt
import datetime
from functools import wraps
import os
from bson import ObjectId
from bson.errors import InvalidId

my_reports_bp = Blueprint("my_reports", __name__)

# MongoDB Setup
client = MongoClient(os.getenv("MONGO_URL"))
db = client["users"]
users_collection = db["register"]
reports_collection = db["report_history"]

# Secret key for JWT
SECRET_KEY = os.getenv("SECRET_KEY")

# JWT token verification decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', None)
        if not token:
            return jsonify({"message": "Missing token"}), 401

        try:
            token = token.split()[1]  # Remove "Bearer"
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = data["user_id"]

            try:
                user_object_id = ObjectId(user_id)
            except InvalidId:
                return jsonify({"message": "Invalid token format"}), 401

            current_user = users_collection.find_one({"_id": user_object_id})
            if not current_user:
                return jsonify({"message": "User not found"}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return f(current_user, *args, **kwargs)
    return decorated
@my_reports_bp.route('/my-reports', methods=['GET'])
@token_required
def get_my_reports(current_user):
    try:
        user_email = current_user.get("email")
        reports_cursor = reports_collection.find({"userEmail": user_email}).sort("dateReported", -1)  # DESCENDING = -1

        reports = []
        for report in reports_cursor:
            date_reported = report.get('dateReported')
            if isinstance(date_reported, (int, float)):
                # Convert milliseconds timestamp to ISO format string
                dt = datetime.datetime.utcfromtimestamp(date_reported / 1000)
                submitted_at = dt.isoformat() + "Z"
            else:
                submitted_at = None

            reports.append({
                "username": report.get('username', 'N/A'),
                "reason": report.get("reason", "No reason provided."),
                "dateReported": submitted_at,
                "status": report.get("status", "Pending"),
            })

        return jsonify(reports), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching reports: {str(e)}")
        return jsonify({"error": "Failed to fetch reports"}), 500

