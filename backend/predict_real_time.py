import pandas as pd
import joblib

# Load the trained model
model = joblib.load("model/final_hybrid_model.pkl")

# Simulated real-time input
features = {
    "has_profile_pic": 1,
    "username_length": 0.27,
    "fullname_words": 0,
    "fullname_nums_length": 0,
    "name_equals_username": 0,
    "bio_length": 53,
    "external_url": 0,
    "is_private": 0,
    "posts": 32,
    "followers": 1000,
    "followees": 955
}

# Convert input to DataFrame
df = pd.DataFrame([features])

# 🔁 Rename columns to match those used during model training
df = df.rename(columns={
    "has_profile_pic": "profile pic",
    "username_length": "nums/length username",
    "fullname_words": "fullname words",
    "fullname_nums_length": "nums/length fullname",
    "name_equals_username": "name==username",
    "bio_length": "description length",
    "external_url": "external URL",
    "is_private": "private",
    "posts": "#posts",
    "followers": "#followers",
    "followees": "#follows"
})

# ✅ Ensure the column order matches exactly
expected_columns = [
    "profile pic",
    "nums/length username",
    "fullname words",
    "nums/length fullname",
    "name==username",
    "description length",
    "external URL",
    "private",
    "#posts",
    "#followers",
    "#follows"
]
df = df[expected_columns]

# Make prediction
prediction = model.predict(df)[0]
print("🧠 Prediction:", "Fake" if prediction == 1 else "Real")
