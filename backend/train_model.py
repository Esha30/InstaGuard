import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import confusion_matrix, classification_report
import joblib
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

# Load dataset
df = pd.read_csv("dataset/Instagram_fake_profile_dataset.csv")
df.columns = [
    "profilePic", "usernameLengthRatio", "fullnameWords", "fullnameLengthRatio",
    "nameMatchesUsername", "bioLength", "hasExternalUrl", "isPrivate",
    "postsCount", "followersCount", "followingCount", "fake"
]

# Check target distribution
print("Target distribution:\n", df['fake'].value_counts())

# Features & target
X = df.drop("fake", axis=1)
y = df["fake"]

# === Optional: Use SMOTE if class imbalance is very high ===
# from imblearn.over_sampling import SMOTE
# sm = SMOTE(random_state=42)
# X, y = sm.fit_resample(X, y)

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Save the scaler
joblib.dump(scaler, "model/scaler.pkl")

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Train Random Forest with class weight to handle imbalance
rf = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
rf.fit(X_train, y_train)
rf_preds = rf.predict(X_test)

# Train XGBoost with scale_pos_weight for imbalance
scale_weight = (sum(y == 0) / sum(y == 1))  # real / fake
xgb = XGBClassifier(eval_metric='logloss', use_label_encoder=False, scale_pos_weight=scale_weight)
xgb.fit(X_train, y_train)
xgb_preds = xgb.predict(X_test)

# Hybrid predictions
rf_probs = rf.predict_proba(X_test)[:, 1]
xgb_probs = xgb.predict_proba(X_test)[:, 1]
hybrid_probs = (rf_probs + xgb_probs) / 2

# === Try different thresholds if needed ===
hybrid_threshold = 0.5
hybrid_preds = (hybrid_probs > hybrid_threshold).astype(int)

# Evaluation
print("\n--- Random Forest Report ---")
print(classification_report(y_test, rf_preds))
sns.heatmap(confusion_matrix(y_test, rf_preds), annot=True, fmt='d', cmap='Blues')
plt.title("Random Forest Confusion Matrix")
plt.show()

print("\n--- XGBoost Report ---")
print(classification_report(y_test, xgb_preds))
sns.heatmap(confusion_matrix(y_test, xgb_preds), annot=True, fmt='d', cmap='Greens')
plt.title("XGBoost Confusion Matrix")
plt.show()

print("\n--- Hybrid Model Report ---")
print(classification_report(y_test, hybrid_preds))
sns.heatmap(confusion_matrix(y_test, hybrid_preds), annot=True, fmt='d', cmap='Purples')
plt.title("Hybrid Confusion Matrix")
plt.show()

# Save models
joblib.dump((rf, xgb), "model/hybrid_model.pkl")
print("Training completed and models saved successfully.")
