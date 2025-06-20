from flask import Blueprint, jsonify, current_app, request
from pymongo import DESCENDING
import datetime
from functools import wraps
import jwt
from pymongo import MongoClient, DESCENDING
from bson import ObjectId
from bson.errors import InvalidId
import os
# Replace with your actual secret key and collections
# MongoDB Setup
client = MongoClient(os.getenv("MONGO_URL"))
db = client["users"]
users_collection = db["register"]
reports_collection = db["report_history"]

# Secret key for JWT
SECRET_KEY = os.getenv("SECRET_KEY")

admin_reports_bp = Blueprint("admin_reports", __name__)
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

@admin_reports_bp.route("/admin-reports", methods=["GET"])
@token_required
def get_admin_reports(current_user):
    try:
        user_email = current_user.get("email")
        if not user_email:
            return jsonify({"error": "User email not found"}), 400

        # Query all reports, optionally admin can filter or paginate here
        reports_cursor = reports_collection.find().sort("dateReported", DESCENDING)

        reports = []
        for report in reports_cursor:
            date_reported = report.get("dateReported")
            if isinstance(date_reported, (int, float)):
                dt = datetime.datetime.utcfromtimestamp(date_reported / 1000)
                date_iso = dt.isoformat() + "Z"
            elif isinstance(date_reported, datetime.datetime):
                date_iso = date_reported.isoformat() + "Z"
            else:
                date_iso = None

            reports.append(
                {
                    "username": report.get("username", "N/A"),
                    "reason": report.get("reason", "No reason provided."),
                    "status": report.get("status", "Pending"),
                    "dateReported": date_iso,
                }
            )

        return jsonify(reports), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching admin reports: {e}")
        return jsonify({"error": "Failed to fetch reports"}), 500
