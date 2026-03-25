import pandas as pd
import numpy as np
import io
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_curve, auc, roc_auc_score
from google.colab import files

# 1. Upload Dataset
print("Please upload the 'Gestational Diabetic Dat Set (1).csv' file:")
uploaded = files.upload()

# Get the filename (assuming only one file is uploaded)
filename = list(uploaded.keys())[0]

# 2. Load Dataset
print(f"Loading dataset from {filename}...")
try:
    df = pd.read_csv(io.BytesIO(uploaded[filename]))
except Exception as e:
    print(f"Error loading CSV: {e}")
    exit(1)

# 3. Preprocessing
if 'Case Number' in df.columns:
    df = df.drop(columns=['Case Number'])

column_mapping = {
    'Class Label(GDM /Non GDM)': 'Outcome',
    'No of Pregnancy': 'No_of_Pregnancy',
    'Gestation in previous Pregnancy': 'Gestation_in_previous_Pregnancy',
    'Family History': 'Family_History',
    'unexplained prenetal loss': 'unexplained_prenetal_loss',
    'Large Child or Birth Default': 'Large_Child_or_Birth_Default',
    'Sys BP': 'Sys_BP',
    'Dia BP': 'Dia_BP',
    'Sedentary Lifestyle': 'Sedentary_Lifestyle'
}
df.rename(columns=column_mapping, inplace=True)

# Define features (X) and target (y)
X = df.drop(columns=['Outcome'])
y = df['Outcome']

# Handle Missing Values
imputer = SimpleImputer(strategy='mean')
X_imputed = imputer.fit_transform(X)
X = pd.DataFrame(X_imputed, columns=X.columns)

# 4. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Model Training & Evaluation
models = {
    "Logistic Regression": LogisticRegression(max_iter=2000, random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=5),
    "Gradient Boosting": GradientBoostingClassifier(random_state=42)
}

print("\n" + "="*80)
print(f"{'Model':<25} | {'Accuracy':<10} | {'Recall':<10} | {'F1 Score':<10}")
print("="*80)

plt.figure(figsize=(10, 8))  # For ROC Curve

for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc_score = roc_auc_score(y_test, y_prob)

    print(f"{name:<25} | {acc:.2%}    | {rec:.2%}    | {f1:.2%}")
    
    # ROC Curve Plotting
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    plt.plot(fpr, tpr, label=f'{name} (AUC = {auc_score:.2f})')

# Show ROC Curve
plt.plot([0, 1], [0, 1], 'k--', lw=2)
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver Operating Characteristic (ROC) Curves')
plt.legend(loc="lower right")
plt.show()

# 6. Feature Importance (Explainable AI)
print("\n" + "="*40)
print("EXPLAINABLE AI: FEATURE IMPORTANCE")
print("="*40)

rf_model = models["Random Forest"]
importances = rf_model.feature_importances_
feature_names = list(X.columns)

# Convert to DataFrame for easier plotting
fi_df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
fi_df = fi_df.sort_values(by='Importance', ascending=False)

# Print Top 5 Features
print("\nTop 5 Most Important Factors for GDM Prediction:")
for i, row in fi_df.head(5).iterrows():
    print(f"- {row['Feature']}: {row['Importance']:.4f}")

# Plot Feature Importance
plt.figure(figsize=(12, 6))
sns.barplot(x='Importance', y='Feature', data=fi_df, palette='viridis')
plt.title('Global Feature Importance (Random Forest)')
plt.xlabel('Importance Score')
plt.ylabel('Feature')
plt.show()
