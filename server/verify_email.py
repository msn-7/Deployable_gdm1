import requests
import json

url = 'http://localhost:5000/api/predict'

# High Risk Data
data = {
    "Age": 35,
    "No_of_Pregnancy": 3,
    "Gestation_in_previous_Pregnancy": 1,
    "BMI": 35.0,
    "HDL": 40,
    "Family_History": 1,
    "unexplained_prenetal_loss": 1,
    "Large_Child_or_Birth_Default": 1,
    "PCOS": 1,
    "Sys_BP": 140,
    "Dia_BP": 95,
    "OGTT": 200,
    "Hemoglobin": 11.0,
    "Sedentary_Lifestyle": 1,
    "Prediabetes": 1,
    "patient_email": "test_patient@example.com",
    "doctor_email": "test_doctor@example.com"
}

try:
    response = requests.post(url, json=data)
    response.raise_for_status()
    result = response.json()
    
    print("Status Code:", response.status_code)
    print("Risk Level:", result.get('risk_level'))
    print("Precautions returned:", len(result.get('precautions', [])))
    print("Medications returned:", len(result.get('medications', [])))
    print("Top Features:", len(result.get('top_features', [])))
    
    if result.get('risk_level') == 'High Risk' and len(result.get('precautions')) > 0:
        print("\nSUCCESS: High Risk detected and precautions returned.")
    else:
        print("\nWARNING: Unexpected result - check logic.")

    print("\nFull Response:")
    print(json.dumps(result, indent=2))

except Exception as e:
    print(f"Error: {e}")
