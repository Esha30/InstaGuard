from flask import Blueprint, request, jsonify
from functools import wraps
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
import os
import jwt

admin_settings_bp = Blueprint("admin_settings", __name__)

# Connect to MongoDB
client = MongoClient(os.getenv("MONGO_URL"))
db = client["users"]

# Collections
users_collection = db["register"]
reports_collection = db["report_history"]
SETTINGS_COLLECTION = db["settings"]

SECRET_KEY = os.getenv("SECRET_KEY")

# ----------------------------- #
# JWT token verification decorator
# ----------------------------- #
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', None)
        if not token:
            return jsonify({"message": "Missing token"}), 401

        try:
            token = token.split()[1]  # Strip "Bearer"
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = data.get("user_id")
            user_object_id = ObjectId(user_id)
            current_user = users_collection.find_one({"_id": user_object_id})
            if not current_user:
                return jsonify({"message": "User not found"}), 401
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, InvalidId):
            return jsonify({"message": "Invalid or expired token"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# ----------------------------- #
# Admin-only route decorator
# ----------------------------- #
def admin_required(fn):
    @wraps(fn)
    def wrapper(current_user, *args, **kwargs):
        if current_user.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return fn(current_user, *args, **kwargs)
    return wrapper

# ----------------------------- #
# Helper: Get or create settings
# ----------------------------- #
def get_or_create_settings():
    settings = SETTINGS_COLLECTION.find_one({})
    if not settings:
        settings = {
            "siteName": "InstaGuard",
            "supportEmail": "instaguard7@gmail.com",
            "notifyReports": True,
            "maintenanceMode": False
        }
        SETTINGS_COLLECTION.insert_one(settings)
    return settings

# ----------------------------- #
# GET: Fetch current admin settings
# ----------------------------- #
@admin_settings_bp.route("/api/admin/settings", methods=["GET"])
@token_required
@admin_required
def get_settings(current_user):
    settings = get_or_create_settings()
    settings["_id"] = str(settings["_id"])
    return jsonify(settings), 200

# ----------------------------- #
# POST: Update admin settings
# ----------------------------- #
@admin_settings_bp.route("/api/admin/settings", methods=["POST"])
@token_required
@admin_required
def update_settings(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing settings data"}), 400

    update_data = {
        "siteName": data.get("siteName", "InstaGuard"),
        "supportEmail": data.get("supportEmail", "instaguard7@gmail.com"),
        "notifyReports": data.get("notifyReports", True),
        "maintenanceMode": data.get("maintenanceMode", False),
    }

    result = SETTINGS_COLLECTION.update_one({}, {"$set": update_data}, upsert=True)

    if result.modified_count or result.upserted_id:
        return jsonify({"message": "Settings updated successfully"}), 200
    else:
        return jsonify({"message": "No changes made"}), 200
