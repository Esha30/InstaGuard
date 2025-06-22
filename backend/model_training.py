import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

# ✅ Get the absolute directory of this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ✅ Set absolute paths for data and model
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "model")
os.makedirs(MODEL_DIR, exist_ok=True)

# ✅ Load and merge datasets from absolute paths
train_path = os.path.join(DATA_DIR, "train.csv")
test_path = os.path.join(DATA_DIR, "test.csv")
df = pd.concat([
    pd.read_csv(train_path),
    pd.read_csv(test_path)
], ignore_index=True)

# Drop rows where target 'fake' is NaN
df = df.dropna(subset=["fake"])

# Split features and target
X = df.drop("fake", axis=1)
y = df["fake"]

# Optional: Split for evaluation
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

# Define models
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
xgb_model = XGBClassifier(n_estimators=100, eval_metric='logloss', random_state=42)

# Create hybrid model using soft voting
hybrid_model = VotingClassifier(
    estimators=[("rf", rf_model), ("xgb", xgb_model)],
    voting="soft"
)

# Train and evaluate
hybrid_model.fit(X_train, y_train)
y_pred = hybrid_model.predict(X_val)

print("📊 Evaluation Report:")
print(classification_report(y_val, y_pred))

# Train on full dataset
hybrid_model.fit(X, y)

# ✅ Save model using absolute path
model_path = os.path.join(MODEL_DIR, "final_hybrid_model.pkl")
joblib.dump(hybrid_model, model_path)
print(f"✅ Hybrid model trained and saved at {model_path}")
