from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import DESCENDING, MongoClient
from bson import ObjectId
import os
import jwt
from functools import wraps
from bson.errors import InvalidId
from datetime import datetime

admin_analytics_bp = Blueprint('admin_analytics', __name__)
client = MongoClient(os.getenv("MONGO_URL"))
db = client["users"]

users_collection = db["register"]
reports_collection = db["report_history"]
activities_collection = db["recent_activities"]  # optional if used later

SECRET_KEY = os.getenv("SECRET_KEY")


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


@admin_analytics_bp.route('/api/admin/analytics', methods=['GET'])
@token_required
def get_admin_analytics(current_user):
    if current_user.get("role") != "admin":
        return jsonify({"msg": "Admin access required"}), 401

    # Count only users with role="user"
    total_users = users_collection.count_documents({"role": "user"})
    verified_users = users_collection.count_documents({"role": "user", "isVerified": True})
    
    total_reports = reports_collection.count_documents({})
    pending_reports = reports_collection.count_documents({"status": "Pending"})

    # Fetch recent users with role "user"
    user_list = []
    users_cursor = users_collection.find({"role": "user"}).sort("createdAt", DESCENDING).limit(5)

    for user in users_cursor:
        created_at = user.get("createdAt", None)

        # Convert timestamp to readable format
        if isinstance(created_at, (int, float)):
            if created_at > 1e12:
                created_dt = datetime.fromtimestamp(created_at / 1000)
            else:
                created_dt = datetime.fromtimestamp(created_at)
        elif isinstance(created_at, datetime):
            created_dt = created_at
        else:
            created_dt = None

        user_list.append({
            "id": str(user["_id"]),
            "fullname": user.get("fullname", ""),
            "email": user.get("email", ""),
            "mobile": user.get("mobile", ""),
            "isVerified": user.get("isVerified", False),
            "createdAt": created_dt.strftime("%Y-%m-%d %H:%M") if created_dt else "Unknown"
        })

    return jsonify({
        "totalUsers": total_users,
        "verifiedUsers": verified_users,
        "totalReports": total_reports,
        "pendingReports": pending_reports,
        "recentUsers": user_list
    }), 200


@admin_analytics_bp.route('/api/admin/recent-activities', methods=['GET'])
@token_required
def get_recent_activities(current_user):
    if current_user.get("role") != "admin":
        return jsonify({"msg": "Admin access required"}), 401

    recent_users = list(users_collection.find().sort("createdAt", DESCENDING).limit(5))
    recent_reports = list(reports_collection.find().sort("dateReported", DESCENDING).limit(5))

    activities = []

    # Add user registration activities
    for user in recent_users:
        timestamp = user.get("createdAt")
        if isinstance(timestamp, (int, float)):
            # If stored as UNIX timestamp seconds or milliseconds
            if timestamp > 1e12:  # milliseconds
                timestamp_dt = datetime.fromtimestamp(timestamp / 1000)
            else:
                timestamp_dt = datetime.fromtimestamp(timestamp)
        elif isinstance(timestamp, datetime):
            timestamp_dt = timestamp
        else:
            timestamp_dt = datetime.utcnow()

        activities.append({
            "description": f"New user registered: {user.get('fullname', 'Unknown')}",
            "timestamp": timestamp_dt.strftime("%Y-%m-%d %H:%M")
        })

    # Add report submission activities, showing submitter's email from 'userEmail' field
    for report in recent_reports:
        submitted_email = report.get('userEmail', 'unknown')

        timestamp = report.get("dateReported")
        if isinstance(timestamp, (int, float)):
            if timestamp > 1e12:  # milliseconds
                timestamp_dt = datetime.fromtimestamp(timestamp / 1000)
            else:
                timestamp_dt = datetime.fromtimestamp(timestamp)
        elif isinstance(timestamp, datetime):
            timestamp_dt = timestamp
        else:
            timestamp_dt = datetime.utcnow()

        activities.append({
            "description": f"New report submitted by {submitted_email}",
            "timestamp": timestamp_dt.strftime("%Y-%m-%d %H:%M")
        })

    # Sort combined activities by timestamp descending
    activities.sort(key=lambda x: x['timestamp'], reverse=True)

    return jsonify({
        "activities": activities[:8]  # limit to last 8 actions
    })
