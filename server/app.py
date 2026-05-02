from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
import os
import json
import sqlite3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from datetime import datetime
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from fpdf import FPDF

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'gdm_model.pkl')
IMPUTER_PATH = os.path.join(BASE_DIR, 'imputer.pkl')
METRICS_PATH = os.path.join(BASE_DIR, 'metrics.json')
FEATURE_IMPORTANCE_PATH = os.path.join(BASE_DIR, 'feature_importance.json')
STATIC_DIR = os.path.join(BASE_DIR, 'static')

# On Vercel the filesystem is read-only except /tmp
if os.environ.get('VERCEL'):
    DB_PATH = '/tmp/gdm_app.db'
    REPORTS_DIR = '/tmp/reports'
else:
    DB_PATH = os.path.join(BASE_DIR, 'gdm_app.db')
    REPORTS_DIR = os.path.join(BASE_DIR, 'reports')

# Ensure directories exist
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# Email Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_USER = os.environ.get("EMAIL_USER")
EMAIL_PASS = os.environ.get("EMAIL_PASS")

# Database Initialization
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # Predictions Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            date TEXT,
            patient_name TEXT,
            age REAL,
            prediction TEXT,
            probability REAL,
            risk_level TEXT
        )
    ''')
    
    # Check if user_id column exists (Migration)
    c.execute("PRAGMA table_info(predictions)")
    columns = [info[1] for info in c.fetchall()]
    if 'user_id' not in columns:
        print("Migrating Database: Adding user_id column...")
        try:
            c.execute("ALTER TABLE predictions ADD COLUMN user_id INTEGER")
        except Exception as e:
            print(f"Migration Error: {e}")

    # Users Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password_hash TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Load Models
model = None
imputer = None

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(IMPUTER_PATH, 'rb') as f:
        imputer = pickle.load(f)
    print("Model and Imputer loaded successfully.")
except FileNotFoundError:
    print(f"Error: Model or Imputer not found. Please run train_model.py first.")

# Load Feature Importance
global_feature_importance = []
if os.path.exists(FEATURE_IMPORTANCE_PATH):
    with open(FEATURE_IMPORTANCE_PATH, 'r') as f:
        global_feature_importance = json.load(f)

def get_risk_level(prob):
    if prob < 0.3:
        return "Low Risk", "Keep up the healthy lifestyle! Maintain a balanced diet.", "text-green-600"
    elif prob < 0.7:
        return "Medium Risk", "Consult a dietician. Control carbohydrate intake and monitor glucose.", "text-yellow-600"
    else:
        return "High Risk", "Immediate medical consultation required. Strict diet control and frequent monitoring.", "text-red-600"

# PDF Generation Function
def generate_pdf_report(data, result, doctor_notes="", prescribed_meds=""):
    pdf = FPDF()
    pdf.add_page()
    
    # Title
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, "GDM Risk Assessment Report", ln=True, align='C')
    pdf.ln(10)
    
    # Patient Info
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, "Patient Information:", ln=True)
    pdf.set_font("Arial", '', 12)
    pdf.cell(0, 10, f"Name: {data.get('patient_name', 'Anonymous')}", ln=True)
    pdf.cell(0, 10, f"Age: {data.get('Age')} years", ln=True)
    pdf.cell(0, 10, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True)
    pdf.ln(5)
    
    # Risk Assessment
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, "Assessment Result:", ln=True)
    pdf.set_font("Arial", '', 12)
    pdf.cell(0, 10, f"Risk Level: {result['risk_level']}", ln=True)
    pdf.cell(0, 10, f"Probability: {result['probability']:.1%}", ln=True)
    pdf.ln(5)
    
    # Clinical Data Summary
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, "Clinical Data:", ln=True)
    pdf.set_font("Arial", '', 10)
    features = [
        f"BMI: {data.get('BMI')}",
        f"Glucose (OGTT): {data.get('OGTT')}",
        f"Blood Pressure: {data.get('Sys_BP')}/{data.get('Dia_BP')}",
        f"HDL Cholesterol: {data.get('HDL')}",
        f"Hemoglobin: {data.get('Hemoglobin')}"
    ]
    for feat in features:
        pdf.cell(0, 7, f"- {feat}", ln=True)
    pdf.ln(5)

    # Automated Recommendations (Model Based)
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, "Automated Analysis:", ln=True)
    pdf.set_font("Arial", '', 10)
    pdf.multi_cell(0, 7, f"Model Advice: {result['advice']}")
    
    if result['precautions']:
        pdf.ln(2)
        pdf.set_font("Arial", 'B', 10)
        pdf.cell(0, 7, "Standard Precautions:", ln=True)
        pdf.set_font("Arial", '', 10)
        for p in result['precautions']:
            pdf.cell(0, 7, f"- {p}", ln=True)

    # Doctor's Notes & Medications (Added by Doctor)
    if doctor_notes or prescribed_meds:
        pdf.ln(5)
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, "Doctor's Advice & Prescription:", ln=True)
        
        if doctor_notes:
            pdf.set_font("Arial", 'B', 10)
            pdf.cell(0, 7, "Notes / Instructions:", ln=True)
            pdf.set_font("Arial", '', 10)
            pdf.multi_cell(0, 7, doctor_notes)
            pdf.ln(2)

        if prescribed_meds:
            pdf.set_font("Arial", 'B', 10)
            pdf.cell(0, 7, "Prescribed Medications:", ln=True)
            pdf.set_font("Arial", '', 10)
            pdf.multi_cell(0, 7, prescribed_meds)

    # Footer
    pdf.ln(10)
    pdf.set_font("Arial", 'I', 8)
    pdf.cell(0, 10, "This report is generated by an AI model and reviewed by a medical professional.", align='C')
    
    filename = f"report_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)
    pdf.output(filepath)
    return filepath

def send_email_notification(to_email, subject, body, attachment_path=None):
    if not EMAIL_USER or not EMAIL_PASS:
        msg = "Email not configured: EMAIL_USER or EMAIL_PASS environment variables are not set."
        print(msg)
        return False, msg

    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))
        
        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, "rb") as f:
                attach = MIMEApplication(f.read(), _subtype="pdf")
                attach.add_header('Content-Disposition', 'attachment', filename=os.path.basename(attachment_path))
                msg.attach(attach)

        # Use a timeout to avoid hanging forever
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15)
        server.ehlo()
        server.starttls()
        server.ehlo()
        # Strip spaces from App Password (Gmail App Passwords are 16 chars, spaces are just for display)
        app_pass = (EMAIL_PASS or "").replace(" ", "")
        server.login(EMAIL_USER or "", app_pass)
        server.send_message(msg)
        server.quit()
        print(f"Email sent successfully to {to_email}")
        return True, None
    except smtplib.SMTPAuthenticationError:
        error = (
            "SMTP Authentication failed. Your Gmail App Password may be invalid or expired. "
            "Please go to Google Account → Security → 2-Step Verification → App passwords "
            "and generate a new App Password, then update EMAIL_PASS in server/.env."
        )
        print(f"Email auth error: {error}")
        return False, error
    except smtplib.SMTPConnectError as e:
        error = f"Could not connect to SMTP server ({SMTP_SERVER}:{SMTP_PORT}): {e}"
        print(error)
        return False, error
    except Exception as e:
        error = f"Failed to send email: {e}"
        print(error)
        return False, error

# --- Auth Endpoints ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not name or not email or not password:
        return jsonify({"error": "Missing fields"}), 400
        
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    try:
        password_hash = generate_password_hash(password)
        c.execute("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", (name, email, password_hash))
        conn.commit()
        user_id = c.lastrowid
        conn.close()
        return jsonify({"message": "User registered successfully", "user": {"id": user_id, "name": name, "email": email}})
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Email already exists"}), 409
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Missing fields"}), 400
        
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, name, email, password_hash FROM users WHERE email=?", (email,))
    user = c.fetchone()
    conn.close()
    
    if user and check_password_hash(user[3], password):
        return jsonify({"message": "Login successful", "user": {"id": user[0], "name": user[1], "email": user[2]}})
    else:
        return jsonify({"error": "Invalid credentials"}), 401

# --- Main Endpoints ---

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok", 
        "model_loaded": model is not None,
        "email_configured": bool(EMAIL_USER and EMAIL_PASS)
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    if not model or not imputer:
        return jsonify({"error": "Model not loaded"}), 500

    data = request.json
    print("Received data:", data) 
    
    # Feature order
    features = [
        float(data.get('Age', 0)),
        float(data.get('No_of_Pregnancy', 0)),
        float(data.get('Gestation_in_previous_Pregnancy', 0)),
        float(data.get('BMI', 0)),
        float(data.get('HDL', 0)),
        int(data.get('Family_History', 0)),
        int(data.get('unexplained_prenetal_loss', 0)),
        int(data.get('Large_Child_or_Birth_Default', 0)),
        int(data.get('PCOS', 0)),
        float(data.get('Sys_BP', 0)),
        float(data.get('Dia_BP', 0)),
        float(data.get('OGTT', 0)),
        float(data.get('Hemoglobin', 0)),
        int(data.get('Sedentary_Lifestyle', 0)),
        int(data.get('Prediabetes', 0))
    ]

    # Prediction
    prediction = model.predict([features])[0]
    probability = model.predict_proba([features])[0][1]

    risk_level, advice, color_class = get_risk_level(probability)
    
    # Save to Database
    user_id = data.get('user_id') # Optional user ID if logged in
    prediction_id = None
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''
            INSERT INTO predictions (user_id, date, patient_name, age, prediction, probability, risk_level)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            data.get('patient_name', 'Anonymous'),
            data.get('Age', 0),
            "GDM Positive" if prediction == 1 else "GDM Negative",
            probability,
            risk_level
        ))
        prediction_id = c.lastrowid
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Database error: {e}")

    # Detailed Precautions & Medications Guidelines
    precautions = []
    medications_guidelines = []
    
    if risk_level == "High Risk":
        precautions = [
            "Monitor blood glucose levels 4 times a day.",
            "Strict dietary control: Low carb, high fiber.",
            "Regular fetal monitoring (ultrasound).",
            "Consult specialist immediately."
        ]
        medications_guidelines = [
            "Insulin therapy may be required (Consult Doctor).",
            "Metformin (if prescribed)."
        ]
    elif risk_level == "Medium Risk":
        precautions = [
            "Monitor blood glucose daily.",
            "Moderate exercise (walking 30 mins/day).",
            "Dietary modifications."
        ]
        medications_guidelines = [
            "Lifestyle modification is primary treatment.",
            "Medication only if diet fails."
        ]
    else:
        precautions = [
            "Maintain healthy diet.",
            "Regular exercise.",
            "Routine prenatal checkups."
        ]
        medications_guidelines = ["None required."]

    # Feature Importance
    top_features = []
    try:
        if global_feature_importance:
             top_features = [
                {"feature": item["name"], "importance": item["value"]} 
                for item in global_feature_importance[:3]
            ]
    except Exception as e:
        print(f"Feature importance extraction failed: {e}")
        
    # NOTE: Email is NOT sent here anymore. 
    # It will be sent via /api/send-report after Doctor's review.

    return jsonify({
        "prediction_id": prediction_id,  # Return ID for future reference
        "patient_name": data.get('patient_name', 'Anonymous'),
        "patient_email": data.get('patient_email', ''),
        "prediction": int(prediction),
        "probability": float(probability),
        "risk_level": risk_level,
        "advice": advice,
        "precautions": precautions,
        "medications": medications_guidelines,
        "color_class": color_class,
        "top_features": top_features
    })

@app.route('/api/send-report', methods=['POST'])
def send_report():
    data = request.json
    prediction_id = data.get('prediction_id')
    doctor_notes = data.get('doctor_notes', '')
    prescribed_meds = data.get('prescribed_meds', '')
    patient_email = data.get('patient_email')
    
    if not patient_email:
        return jsonify({"error": "Patient email is required"}), 400

    # Retrieve prediction details from DB if needed, or use passed data.
    # For simplicity, we'll re-construct the result context from passed data or existing DB.
    # To make the PDF rich, we need the original input data (Age, BMI etc).
    # Since we didn't store *every* feature in the DB (only key ones), we might rely on the frontend
    # passing the full context back, OR we assume the doctor is editing the *current* result.
    
    # Let's use the data passed from the frontend for the PDF content.
    report_data = data.get('report_data', {}) # Should contain Age, BMI, patient_name etc.
    result_context = data.get('result_context', {}) # risk_level, advice, etc.

    # Generate PDF
    pdf_path = None
    try:
        pdf_path = generate_pdf_report(report_data, result_context, doctor_notes, prescribed_meds)
    except Exception as e:
        print(f"PDF Gen Error: {e}")
        return jsonify({"error": "Failed to generate PDF"}), 500

    # Email Body
    email_body = f"""
<html><body>
<h2 style="color:#1e40af;">GDM Risk Assessment Report</h2>
<p><strong>Patient Name:</strong> {report_data.get('patient_name', 'Anonymous')}</p>
<p><strong>Risk Level:</strong> <span style="color:{'red' if result_context.get('risk_level')=='High Risk' else 'orange' if result_context.get('risk_level')=='Medium Risk' else 'green'};">{result_context.get('risk_level')}</span></p>
<p><strong>Probability:</strong> {result_context.get('probability', 0):.1%}</p>
<hr/>
<h3>Doctor's Notes</h3>
<p>{doctor_notes or 'No additional notes.'}</p>
<h3>Prescribed Medications</h3>
<p>{prescribed_meds or 'None specified.'}</p>
<hr/>
<p style="color:#6b7280;font-size:12px;">The detailed PDF report is attached. This report is generated by an AI model and reviewed by a medical professional.</p>
</body></html>
"""
    
    success, err_msg = send_email_notification(
        patient_email,
        f"GDM Assessment: {result_context.get('risk_level')}",
        email_body,
        pdf_path
    )
    
    if success:
        return jsonify({"message": "Report sent successfully"})
    else:
        return jsonify({"error": err_msg or "Failed to send email"}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if not model:
        return jsonify({"error": "Model not loaded"}), 500
        
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file:
        try:
            df = pd.read_csv(file)
            required_cols = [
                'Age', 'No_of_Pregnancy', 'Gestation_in_previous_Pregnancy', 'BMI', 'HDL',
                'Family_History', 'unexplained_prenetal_loss', 'Large_Child_or_Birth_Default',
                'PCOS', 'Sys_BP', 'Dia_BP', 'OGTT', 'Hemoglobin', 'Sedentary_Lifestyle', 'Prediabetes'
            ]
            
            col_map = {c.lower(): c for c in df.columns}
            missing = []
            for req in required_cols:
                if req.lower() in col_map:
                    if col_map[req.lower()] != req:
                        df.rename(columns={col_map[req.lower()]: req}, inplace=True)
                else:
                    missing.append(req)

            if missing:
                return jsonify({"error": f"Missing required columns: {', '.join(missing)}"}), 400

            predictions = model.predict(df[required_cols])
            probabilities = model.predict_proba(df[required_cols])[:, 1]
            
            # Save batch results to DB
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            results = []
            for i, pred in enumerate(predictions):
                risk, advice, _ = get_risk_level(probabilities[i])
                
                c.execute('''
                    INSERT INTO predictions (date, patient_name, age, prediction, probability, risk_level)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    f"Batch Patient {i+1}",
                    float(df.iloc[i]['Age']) if 'Age' in df.columns else 0,
                    "GDM Positive" if pred == 1 else "GDM Negative",
                    probabilities[i],
                    risk
                ))
                
                results.append({
                    "Patient_ID": i + 1,
                    "Prediction": "GDM Positive" if pred == 1 else "GDM Negative",
                    "Probability": f"{probabilities[i]*100:.1f}%",
                    "Risk_Level": risk
                })
            conn.commit()
            conn.close()
                
            return jsonify({"results": results})
        except Exception as e:
            print(f"Upload Error: {str(e)}")
            return jsonify({"error": f"Error processing file: {str(e)}"}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    user_id = request.args.get('user_id')
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        if user_id:
             c.execute('SELECT * FROM predictions WHERE user_id=? ORDER BY id DESC LIMIT 50', (user_id,))
        else:
             c.execute('SELECT * FROM predictions ORDER BY id DESC LIMIT 50')
             
        rows = c.fetchall()
        
        history = []
        for row in rows:
            # Adjust index based on new schema (id, user_id, date, ...) or old schema
            # Let's assume schema matches init_db: id, user_id, date, patient_name, age, prediction, probability, risk_level
            # But wait, existing DB has no user_id. We need to handle migration or loose schema.
            # Easiest way: check column count or handle index error.
            
            # Quick hack for migration: fetch column names
            # For now, let's just grab by index assuming new table structure if new table created
            
            # Since we just updated init_db, existing table WONT be updated automatically.
            # We should probably handle this.
            
            # If user_id column is missing in existing DB, this query might fail or return fewer columns.
            pass

        # Re-fetching with more robust logic
        # Get column names first
        columns = [description[0] for description in c.description]
        history = [dict(zip(columns, row)) for row in rows]
        
        conn.close()
        return jsonify(history)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM predictions")
        total = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM predictions WHERE risk_level='High Risk'")
        high = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM predictions WHERE risk_level='Low Risk'")
        low = c.fetchone()[0]
        conn.close()
        
        return jsonify({
            "total_predictions": total,
            "high_risk": high,
            "low_risk": low
        })
    except:
         return jsonify({
            "total_predictions": 0,
            "high_risk": 0,
            "low_risk": 0
        })

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    if not os.path.exists(METRICS_PATH):
        return jsonify({"error": "Metrics not found"}), 404
    
    with open(METRICS_PATH, 'r') as f:
        metrics = json.load(f)
    return jsonify(metrics)

@app.route('/api/feature-importance', methods=['GET'])
def get_feature_importance():
    if not os.path.exists(FEATURE_IMPORTANCE_PATH):
        return jsonify({"error": "Feature importance data not found"}), 404
    
    with open(FEATURE_IMPORTANCE_PATH, 'r') as f:
        data = json.load(f)
    return jsonify(data)

@app.route('/api/images/<filename>')
def get_image(filename):
    return send_from_directory(STATIC_DIR, filename)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug, host='0.0.0.0', port=port)
