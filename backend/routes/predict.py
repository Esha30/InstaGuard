from flask import Blueprint, request, jsonify
from functools import wraps
from pymongo import MongoClient
from bson.objectid import ObjectId
from bson.errors import InvalidId
from flask_cors import cross_origin
from dotenv import load_dotenv
from routes.extract_features import extract_features
from routes.real_accounts import REAL_BLOCKED_ACCOUNTS
import pandas as pd
import joblib
import jwt
import os
import logging
from datetime import datetime
from pathlib import Path

# ---------------------------- Setup ----------------------------
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
MODEL_VERSION = os.getenv("MODEL_VERSION", "v1.0")

client = MongoClient(os.getenv("MONGO_URL"))
db = client["users"]
users_collection = db["register"]
results_collection = db["results"]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ✅ Load model using robust path handling
model = None
try:
    model_path = Path(__file__).resolve().parent.parent / "model" / "final_hybrid_model.pkl"
    if model_path.exists():
        model = joblib.load(model_path)
        logger.info(f"✅ Model loaded successfully from {model_path}")
    else:
        logger.error(f"❌ Model file not found at {model_path}")
except Exception as e:
    logger.error(f"[Model Load Error] {e}")

predict_bp = Blueprint("predict", __name__)

expected_columns = [
    "profile pic", "nums/length username", "fullname words",
    "nums/length fullname", "name==username", "description length",
    "external URL", "private", "#posts", "#followers", "#follows"
]

# ------------------------ Token Decorator ------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]

        if not token:
            return jsonify({'error': 'Missing token'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = data.get("user_id")
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            if not user:
                return jsonify({'error': 'User not found'}), 404
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, InvalidId) as e:
            logger.error(f"[Token Error] {e}")
            return jsonify({'error': 'Invalid or expired token'}), 401
        except Exception as e:
            logger.error(f"[Token Validation Failed] {e}")
            return jsonify({'error': str(e)}), 500

        return f(user, *args, **kwargs)
    return decorated

# ------------------------ Preprocessing ------------------------
def preprocess_features(features: dict):
    try:
        df = pd.DataFrame([features])
        df = df.rename(columns={
            "has_profile_pic": "profile pic",
            "nums/length_username": "nums/length username",
            "fullname_words": "fullname words",
            "nums/length_fullname": "nums/length fullname",
            "name==username": "name==username",
            "bio_length": "description length",
            "external_url": "external URL",
            "posts": "#posts",
            "followers": "#followers",
            "followees": "#follows"
        })
        df["private"] = 0
        for col in expected_columns:
            if col not in df.columns:
                df[col] = 0
        return df[expected_columns]
    except Exception as e:
        logger.error(f"[Preprocessing Error] {e}")
        return None

# ------------------------ Main Prediction Route ------------------------
@predict_bp.route('/predict', methods=['POST'])
@cross_origin()
@token_required
def predict(user):
    try:
        if not model:
            return jsonify({"error": "Model not loaded"}), 500

        data = request.get_json()
        username = data.get("username", "").strip().lower()

        if not username:
            return jsonify({"error": "Username is required"}), 400

        if username in REAL_BLOCKED_ACCOUNTS:
            restriction_reason = REAL_BLOCKED_ACCOUNTS[username]
            logger.info(f"[Geo-Restricted Account] @{username} marked as real but restricted. Reason: {restriction_reason}")
            result_data = {
                "user_id": str(user["_id"]),
                "username": username,
                "features": {},
                "prediction": "Real",
                "model_version": MODEL_VERSION,
                "confidence": 1.0,
                "timestamp": datetime.utcnow(),
                "note": restriction_reason
            }
            results_collection.insert_one(result_data)
            return jsonify({
                "username": username,
                "prediction": "Real",
                "confidence": 1.0,
                "message": "This is a verified real account restricted for extraction.",
                "note": restriction_reason
            }), 200

        features = extract_features(username)

        if features == "USER_NOT_FOUND":
            return jsonify({
                "error": "Username does not exist. Try another username.",
                "status": "failed"
            }), 404

        if not features or not isinstance(features, dict):
            return jsonify({"error": "Feature extraction failed", "status": "failed"}), 400

        if features.get("status") == "failed":
            return jsonify({"error": features.get("error", "Username does not exist."), "status": "failed"}), 404

        df = preprocess_features(features)
        if df is None or df.empty:
            return jsonify({"error": "Failed to process features"}), 500

        prediction = model.predict(df)[0]
        prob = None
        if hasattr(model, "predict_proba"):
            try:
                prob = model.predict_proba(df)[0][1]
            except Exception as e:
                logger.warning(f"[Probability Error] {e}")
                prob = None

        result = "Fake" if prediction == 1 else "Real"

        result_data = {
            "user_id": str(user["_id"]),
            "username": username,
            "features": features,
            "prediction": result,
            "model_version": MODEL_VERSION,
            "confidence": round(prob, 2) if isinstance(prob, float) else None,
            "timestamp": datetime.utcnow()
        }

        results_collection.insert_one(result_data)
        logger.info(f"[Prediction] {username} → {result} ({round(prob, 2) if isinstance(prob, float) else 'N/A'})")

        return jsonify({
            "username": username,
            "prediction": result,
            "confidence": round(prob, 2) if isinstance(prob, float) else None,
            "message": f"This account appears to be {result.lower()} based on profile metrics."
        }), 200

    except Exception as e:
        logger.error(f"[Prediction Error] {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

# ------------------------ Admin Profile Results Route ------------------------
@predict_bp.route('/admin/profile-results', methods=['GET'])
@cross_origin()
@token_required
def admin_profile_results(user):
    if user.get("role") != "admin":
        return jsonify({"error": "Access denied. Admins only."}), 403

    try:
        cursor = results_collection.find().sort("timestamp", -1)
        output = []
        for doc in cursor:
            output.append({
                "_id": str(doc["_id"]),
                "user_id": str(doc.get("user_id")),
                "username": doc.get("username", ""),
                "features": doc.get("features", {}),
                "prediction": doc.get("prediction", ""),
                "model_version": doc.get("model_version", MODEL_VERSION),
                "confidence": doc.get("confidence", 0),
                "timestamp": doc.get("timestamp").isoformat() if doc.get("timestamp") else None,
                "note": doc.get("note", None)
            })

        return jsonify(output), 200

    except Exception as e:
        logger.error(f"[Admin Profile Results Error] {e}")
        return jsonify({"error": f"Failed to fetch profile results: {str(e)}"}), 500
