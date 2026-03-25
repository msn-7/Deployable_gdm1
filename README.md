# AI-Based Early Prediction System for Gestational Diabetes Mellitus (GDM)

## Overview
This project is a comprehensive web application designed to predict the risk of Gestational Diabetes Mellitus (GDM) in pregnant women using advanced Machine Learning algorithms. The system provides an intuitive interface for patients and doctors to assess risk, visualize contributing factors, and receive automated medical advice via email.

It is built using a **React.js** frontend and a **Python Flask** backend, integrating a trained ML model to provide real-time predictions with **97.02% accuracy**.

---


## 🏗️ System Architecture

The system utilizes a modern, robust architecture seamlessly integrating a responsive frontend, a powerful backend, and an intelligent machine learning engine.

```mermaid
graph LR
    UI[User Interface<br/>(React + Vite)] --> API[API Server<br/>(Flask / Python)]
    API --> Model[ML Model<br/>(Scikit-Learn)]
    API --> DB[Database<br/>(SQLite / CSV)]
    style UI fill:#eff6ff,stroke:#3b82f6,stroke-width:2px
    style API fill:#f0fdf4,stroke:#22c55e,stroke-width:2px
    style Model fill:#faf5ff,stroke:#a855f7,stroke-width:2px
    style DB fill:#fff7ed,stroke:#f97316,stroke-width:2px
```

### Components

1.  **Frontend (User Interface)**
    *   Built with **React.js** and **Vite** for a fast, responsive user experience.
    *   Handles user interactions, form inputs, and visualizes prediction results.
    *   Communicates with the backend via RESTful APIs.

2.  **Backend (API Server)**
    *   A lightweight **Python Flask** server acts as the bridge.
    *   Receives data, validates it, and passes it to the ML model for processing.
    *   Manages authentication and report generation.

3.  **Intelligence Layer (ML Model)**
    *   Uses **Scikit-Learn** logic (Random Forest/ KNN) to process health metrics.
    *   Predicts the risk of Gestational Diabetes based on 15 key indicators.

4.  **Data Layer (Database)**
    *   Stores user profiles, historical prediction data, and model performance metrics.
    *   Supports batch processing via CSV.

---

## 🧠 Machine Learning Algorithms

We trained and evaluated four different supervised learning algorithms to select the best model for this application.

### 1. Algorithms Used
*   **K-Nearest Neighbors (KNN)**: Selected as the **Best Model**.
*   **Random Forest Classifier**: Used for extraction of Feature Importance.
*   **Gradient Boosting Classifier**
*   **Logistic Regression**

### 2. Performance Metrics
The models were evaluated on Accuracy, Precision, Recall, and F1-Score.

| Model | Accuracy | Precision | Recall | F1 Score |
| :--- | :--- | :--- | :--- | :--- |
| **K-Nearest Neighbors** | **97.02%** | **97.06%** | **97.02%** | **97.03%** |
| Logistic Regression | 96.88% | 96.89% | 96.88% | 96.88% |
| Random Forest | 96.74% | 96.78% | 96.74% | 96.75% |
| Gradient Boosting | 96.74% | 96.75% | 96.74% | 96.74% |

---

## 🚀 Key Features

### 1. Predictive Risk Assessment
*   **Manual Prediction**: Users enter 15 clinical parameters (Age, BMI, Glucose, BP, etc.) to get an instant risk level (*Low, Medium, or High*).
*   **Probability Score**: Returns the exact probability of GDM (e.g., 85.4%).

### 2. Batch Processing
*   **CSV Upload**: Healthcare providers can upload a CSV file containing data for hundreds of patients.
*   **Bulk Analysis**: The system processes the file and returns a downloadable report with predictions for every patient.

### 3. Explainable AI (XAI) Approach
To make the model's decisions transparent and trustworthy for medical professionals, we implemented an **Explainable AI (XAI)** module using **Global Feature Importance**.

*   **Methodology**: We utilize the intrinsic feature importance property of the **Random Forest Classifier**. Even if another model (like KNN) performs slightly better for the final classification, the Random Forest model is trained in parallel to extract feature contribution scores.
*   **Technique**: The importance of each feature is calculated based on the **Gini Impurity** decrease. The more a feature decreases the impurity (uncertainty) of the split in the decision trees, the more important it is.
*   **Visualization**: A bar chart on the dashboard ranks the top factors contributing to GDM risk (e.g., *Glucose Level (OGTT)*, *BMI*, *Age*). This helps clinicians understand not just *what* the risk is, but *why* it is high.

### 4. Automated & Intelligent Notifications
*   **Email Alerts**: The system simulates sending emails to both the **Patient** and **Doctor**.
*   **Context-Aware Advice**:
    *   *High Risk*: Suggests insulin therapy consultation, strict diet, and frequent glucose monitoring.
    *   *Medium Risk*: Suggests dietary modifications and moderate exercise.
    *   *Low Risk*: Encourages maintaining a healthy lifestyle.

### 5. Performance Dashboard
*   A dedicated page comparing the performance of all 4 algorithms using interactive charts.

---

## 📋 Medical Features Used
The model is trained on 15 key health indicators:
1.  **Age**
2.  **No. of Pregnancies**
3.  **Gestation in Previous Pregnancy**
4.  **BMI** (Body Mass Index)
5.  **HDL** (High-Density Lipoprotein)
6.  **Family History**
7.  **Unexplained Prenatal Loss**
8.  **Large Child / Birth Defects**
9.  **PCOS** (Polycystic Ovary Syndrome)
10. **Systolic BP**
11. **Diastolic BP**
12. **OGTT** (Oral Glucose Tolerance Test)
13. **Hemoglobin**
14. **Sedentary Lifestyle**
15. **Prediabetes**

---

## 🛠️ Installation & Setup

### Prerequisites
*   Python 3.8+
*   Node.js 16+

### 1. Backend Setup
```bash
# Navigate to server
cd server

# Install dependencies
pip install -r requirements.txt

# Train the models (Generates gdm_model.pkl and metrics.json)
python train_model.py

# Start the Flask API
python app.py
```
*Server runs at: `http://localhost:5000`*

### 2. Frontend Setup
```bash
# Navigate to client
cd client

# Install dependencies
npm install

# Start the React App
npm run dev
```
*App runs at: `http://localhost:5173`*

---

## 🔌 API Endpoints

*   `POST /api/predict`: detailed prediction with risk level, advice, and top features.
*   `POST /api/upload`: Process batch CSV uploads.
*   `GET /api/metrics`: Retrieve model performance stats for the dashboard.
*   `GET /api/feature-importance`: Retrieve global feature importance scores.
*   `GET /api/health`: System health check.

---

## 🔮 Future Enhancements
*   Integration with real SMTP server for live emails.
*   User authentication for doctors and patients.
*   Historical data tracking and trend analysis for patients.

---

## 🎨 Architecture Diagram Generation Prompt

To visualize the system architecture using AI image generators (like ChatGPT, Gemini, or Midjourney), use the following prompt:

> **"Create a modern, high-tech system architecture diagram for a Gestational Diabetes Prediction System. The diagram should feature four distinct, interconnected blocks arranged in a logical flow from left to right:**
>
> 1.  **User Interface**: A sleek web frontend block labeled 'React.js + Vite', representing the patient interacting with a form.
> 2.  **API Server**: A central backend block labeled 'Python Flask', acting as the bridge.
> 3.  **ML Model**: An intelligence block labeled 'Scikit-Learn Model', receiving data from the API.
> 4.  **Database**: A storage block labeled 'Database', connected to the API.
>
> **Style**: Use a clean, professional medical-tech aesthetic with a color palette of soft blues, greens, and white. Connect the blocks with directional arrows showing the data flow: User -> UI -> API -> Model. The background should be clean and white or light grey. Avoid clutter and keep it minimalist."**
