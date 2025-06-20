import uuid
from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URL"))
db = client["users"]
users_collection = db["register"]

def generate_verification_token():
    return str(uuid.uuid4())  # Generate a unique token

def verify_token(token):
    user = users_collection.find_one({"verification_token": token})
    if not user:
        return None  # Invalid token or expired token
    return user

def verify_user(user):
    result = users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"isVerified": True}, "$unset": {"verification_token": ""}}
    )
    return result.modified_count > 0
