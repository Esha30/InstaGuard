# routes/admin/profile.py
from flask import Blueprint, request, jsonify
from bson import ObjectId  
from werkzeug.security import check_password_hash
import bcrypt
from pymongo import MongoClient
import os
import jwt
from functools import wraps
admin_profile = Blueprint("admin_profile", __name__)
client = MongoClient(os.getenv("MONGO_URL"))
db = client["users"]
users_collection = db["register"]
client = MongoClient(os.getenv("MONGO_URL"))
db = client["users"]
users_collection = db["register"]
SECRET_KEY = os.getenv("SECRET_KEY")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', None)
        if not token:
            return jsonify({"message": "Missing token"}), 401

        try:
            token = token.split()[1]  # Bearer <token>
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = users_collection.find_one({"_id": ObjectId(data["user_id"])})
            if not current_user:
                raise Exception("User not found")
        except Exception as e:
            print("JWT error:", e)
            return jsonify({"message": "Token is invalid"}), 401

        return f(current_user, *args, **kwargs)
    return decorated
def is_strong_password(password):
    import re
    # At least 8 characters, 1 number, 1 uppercase, 1 lowercase, 1 special char
    return re.match(r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$', password)

@admin_profile.route('/api/update-password', methods=['PUT'])
@token_required
def update_admin_password(current_user):
    try:
        data = request.get_json()
        print("Received data:", data)  # DEBUG

        current_password = data.get("currentPassword")
        new_password = data.get("newPassword")

        if not current_password or not new_password:
            return jsonify({"success": False, "message": "All fields are required"}), 400

        if current_user.get("role") != "admin":
            return jsonify({"success": False, "message": "Unauthorized access"}), 403

        user_in_db = users_collection.find_one({"_id": current_user["_id"]})

        # Convert stored string hash to bytes before comparison
        stored_password_hash = user_in_db["password"].encode("utf-8")

        if not user_in_db or not bcrypt.checkpw(current_password.encode("utf-8"), stored_password_hash):
            return jsonify({"success": False, "message": "Current password is incorrect"}), 400

        if not is_strong_password(new_password):
            return jsonify({
                "success": False,
                "message": "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
            }), 400

        hashed_new = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
        users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"password": hashed_new.decode("utf-8")}}  # store as string
        )

        return jsonify({"success": True, "message": "Password updated successfully"}), 200

    except Exception as e:
        print("Admin password update error:", e)
        return jsonify({"success": False, "message": "Internal server error"}), 500
