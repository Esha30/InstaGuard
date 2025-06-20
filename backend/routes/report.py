from flask import Blueprint, request, jsonify, current_app
from pymongo import MongoClient
import jwt
import datetime
from functools import wraps
import os
from bson import ObjectId
from bson.errors import InvalidId

report_bp = Blueprint('report_bp', __name__)

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
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"message": "Missing token"}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0] != "Bearer":
            return jsonify({"message": "Invalid token format"}), 401

        token = parts[1]
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = data.get("user_id")

            try:
                user_object_id = ObjectId(user_id)
            except InvalidId:
                return jsonify({"message": "Invalid user ID"}), 401

            current_user = users_collection.find_one({"_id": user_object_id})
            if not current_user:
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

@report_bp.route('/reports', methods=['GET', 'POST'])
@token_required
def handle_reports(current_user):
    if request.method == 'POST':
        data = request.get_json()

        username = data.get("username", "").strip()
        reason = data.get("reason", "").strip()

        if not username or not reason:
            return jsonify({"error": "Missing username or reason"}), 400

        timestamp_ms = int(datetime.datetime.utcnow().timestamp() * 1000)

        report_doc = {
            "username": username,
            "reason": reason,
            "status": "Pending",  # Always set status to Pending
            "dateReported": timestamp_ms,
            "userEmail": current_user.get("email")
        }

        result = reports_collection.insert_one(report_doc)
        report_doc["_id"] = str(result.inserted_id)

        return jsonify(report_doc), 201

    elif request.method == 'GET':
        user_email = current_user.get("email")
        cursor = reports_collection.find({"userEmail": user_email}).sort("dateReported", -1)

        reports = []
        for report in cursor:
            reports.append({
                "id": str(report["_id"]),
                "username": report.get("username", ""),
                "reason": report.get("reason", ""),
                "status": report.get("status", "Pending"),
                "dateReported": report.get("dateReported", "")
            })

        return jsonify(reports), 200
 