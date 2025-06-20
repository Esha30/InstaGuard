from functools import wraps
from flask import request, jsonify, current_app
import jwt
from bson import ObjectId
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["users"]
users_collection = db["register"]

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', None)
        if not token:
            return jsonify({"message": "Missing token"}), 401

        try:
            if "Bearer " in token:
                token = token.split(" ")[1]

            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_app.logger.info(f"Decoded JWT: {data}")

            user = users_collection.find_one({"_id": ObjectId(data["user_id"])})
            if not user:
                return jsonify({"message": "User not found"}), 401

        except Exception as e:
            current_app.logger.error(f"Token error: {e}")
            return jsonify({"message": "Unauthorized"}), 401

        return f(user, *args, **kwargs)
    return decorated
