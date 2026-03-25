from flask import Flask, render_template, request
import pickle
import numpy as np

app = Flask(__name__)

# Load trained model
model = pickle.load(open("diabetes_model.sav", "rb"))

@app.route("/", methods=["GET", "POST"])
def home():
    result = ""
    precaution = ""

    if request.method == "POST":
        inputs = [
            float(request.form["pregnancies"]),
            float(request.form["glucose"]),
            float(request.form["bloodpressure"]),
            float(request.form["skinthickness"]),
            float(request.form["insulin"]),
            float(request.form["bmi"]),
            float(request.form["dpf"]),
            float(request.form["age"])
        ]

        prediction = model.predict([inputs])

        if prediction[0] == 1:
            result = "High Risk of Diabetes"
            precaution = "⚠️ Consult a doctor, reduce sugar intake, exercise daily."
        else:
            result = "Low Risk of Diabetes"
            precaution = "✅ Maintain healthy lifestyle and regular checkups."

    return render_template("index.html", result=result, precaution=precaution)

if __name__ == "__main__":
    app.run(debug=True)
