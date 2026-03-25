import pandas as pd
import numpy as np
import os
import pickle
import json
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_curve, auc, roc_auc_score

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(script_dir, 'Gestational Diabetic Dat Set (1).csv')
model_path = os.path.join(script_dir, 'gdm_model.pkl')
metrics_path = os.path.join(script_dir, 'metrics.json')
imputer_path = os.path.join(script_dir, 'imputer.pkl')
static_dir = os.path.join(script_dir, 'static')

# Ensure static directory exists for images
os.makedirs(static_dir, exist_ok=True)

# 1. Load Dataset
print(f"Loading dataset from {dataset_path}...")
try:
    df = pd.read_csv(dataset_path)
except FileNotFoundError:
    print("Error: Dataset file not found.")
    exit(1)

# 2. Preprocessing
if 'Case Number' in df.columns:
    df = df.drop(columns=['Case Number'])

target_col = 'Class Label(GDM /Non GDM)'
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

# 3. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Model Training & Evaluation
models = {
    "Logistic Regression": LogisticRegression(max_iter=2000, random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=5),
    "Gradient Boosting": GradientBoostingClassifier(random_state=42)
}

results = {}
best_model = None
best_score = 0
best_name = ""
metric_to_optimize = "recall"  # Prioritize Recall for medical diagnosis

plt.figure(figsize=(10, 8))  # For ROC Curve

print("-" * 100)
print(f"{'Model':<25} | {'Accuracy':<10} | {'Precision':<10} | {'Recall':<10} | {'F1 Score':<10} | {'AUC':<10}")
print("-" * 100)

for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc_score = roc_auc_score(y_test, y_prob)
    
    # ROC Curve Plotting
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    plt.plot(fpr, tpr, label=f'{name} (AUC = {auc_score:.2f})')
    
    # Save Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False)
    plt.title(f'Confusion Matrix - {name}')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.savefig(os.path.join(static_dir, f'cm_{name.replace(" ", "_").lower()}.png'))
    plt.close()

    results[name] = {
        "accuracy": float(f"{acc:.4f}"),
        "precision": float(f"{prec:.4f}"),
        "recall": float(f"{rec:.4f}"),
        "f1_score": float(f"{f1:.4f}"),
        "auc": float(f"{auc_score:.4f}")
    }
    
    print(f"{name:<25} | {acc:.2%}    | {prec:.2%}    | {rec:.2%}    | {f1:.2%}    | {auc_score:.2f}")
    
    # Selection logic based on Recall (Sensitivity) to minimize False Negatives
    current_score = rec
    if current_score > best_score:
        best_score = current_score
        best_model = model
        best_name = name

# Finalize ROC Plot
plt.figure(1)
plt.plot([0, 1], [0, 1], 'k--', lw=2)
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver Operating Characteristic (ROC) Curves')
plt.legend(loc="lower right")
plt.savefig(os.path.join(static_dir, 'roc_curve.png'))
plt.close()

print("-" * 100)
print(f"Best Model Selected ({metric_to_optimize.title()}): {best_name} with {metric_to_optimize.title()}: {best_score:.2%}")
print("-" * 100)

# 5. Save Artifacts
with open(model_path, 'wb') as f:
    pickle.dump(best_model, f)

with open(imputer_path, 'wb') as f:
    pickle.dump(imputer, f)

with open(metrics_path, 'w') as f:
    json.dump(results, f, indent=4)

# 6. Save Feature Importance (Random Forest)
rf_model = models["Random Forest"]
importances = rf_model.feature_importances_
feature_names = list(X.columns)
feature_importance_data = [
    {"name": name, "value": float(score)} 
    for name, score in zip(feature_names, importances)
]
feature_importance_data.sort(key=lambda x: x['value'], reverse=True)

feature_importance_path = os.path.join(script_dir, 'feature_importance.json')
with open(feature_importance_path, 'w') as f:
    json.dump(feature_importance_data, f, indent=4)

print("Training complete. Artifacts saved in 'server' and 'server/static'.")

