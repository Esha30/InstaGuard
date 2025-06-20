import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import numpy as np

# Ensure the 'model' folder exists
os.makedirs("model", exist_ok=True)

# Load and merge dataset
df = pd.concat([
    pd.read_csv("data/train.csv"),
    pd.read_csv("data/test.csv")
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

# Remove NaNs from evaluation set just in case
mask = ~pd.isna(y_val)
y_val_clean = y_val[mask]
y_pred_clean = y_pred[mask]

print(classification_report(y_val_clean, y_pred_clean))

# Train on full data
hybrid_model.fit(X, y)

# Save model
joblib.dump(hybrid_model, "model/final_hybrid_model.pkl")
print("✅ Hybrid model trained and saved as model/final_hybrid_model.pkl")
