
from flask import Flask, render_template_string, request, redirect, session, url_for,render_template
import urllib.parse
import math


app = Flask(__name__)  
app.secret_key = 'secret'



def step_data(step):
    steps = {
        1: {
            "title": "Your health journey begins with your name — HEALSYNC+.",
            "fields": [
                {"label": "Name", "name": "name"},
                {"label": "Age", "name": "age"},
                {"label": "Gender", "name": "gender"}
            ]
        },
        2: {
            "title": "Small inputs today, big health improvements tomorrow — CoderX.",
            "fields": [
                {"label": "Height (cm)", "name": "height"},
                {"label": "Weight (kg)", "name": "weight"},
                {"label": "Health Status", "name": "health"}
            ]
        },
        3: {
            "title": "Health begins with understanding.",
            "fields": [
                {"label": "Blood Pressure (eg: 120/80)", "name": "bp"},
                {"label": "Sugar Level", "name": "sugar"},
                {"label": "Body Temperature", "name": "temp"}
            ]
        },
        4: {
            "title": "Your health speaks through symptoms:",
            "fields": [
                {"label": "Current Symptoms (eg: fever, cold)", "name": "symptoms"},
                {"label": "Past Issues", "name": "past"}
            ]
        }
    }
    return steps.get(step)


@app.route('/')
def welcome():
    return redirect(url_for('form_step', step=1))


@app.route('/step/<int:step>', methods=['GET', 'POST'])
def form_step(step):
    step_info = step_data(step)

    if not step_info:
        return redirect(url_for('result'))

    if request.method == 'POST':
        for field in step_info['fields']:
            session[field['name']] = request.form.get(field['name'])
        return redirect(url_for('form_step', step=step + 1))

    back_url = url_for('form_step', step=step - 1) if step > 1 else None

    return render_template(
        'step_form.html',
        page_title=step_info['title'],
        fields=step_info['fields'],
        back_url=back_url
    )


@app.route('/history')
def history():
    return render_template(
        'history.html',
        session_data=session
    )


@app.route('/result')
def result():
    user_problem = session.get('symptoms', 'health')
    search_query = urllib.parse.quote_plus(user_problem)
    article_link = f"https://www.google.com/search?q=articles+about+{search_query}"

    session['result'] = {
        'health': session.get('health'),
        'recommendation': session.get('medication'),
        'exercise': 'Light walking, breathing exercises, for More (Use Physical Checkup)',
        'food': 'Eat fresh fruits and hydrate',
        'quote': 'Take care of your body. It’s the only place you have to live.'
    }

    return render_template(
        'result.html',
        article_link=article_link,
        session_data=dict(session)
    )

 


@app.route('/doctor-assistant', methods=['GET', 'POST'])
def doctor_assistant():

    def safe_div(a, b):
        return round(a / b, 2) if b else 'N/A'

    results = {}

    if request.method == 'POST':
        try:
            f = request.form

            age = int(f['age'])
            gender = f['gender']
            weight = float(f['weight'])
            height = float(f['height'])

            systolic = float(f.get('systolic', 0))
            diastolic = float(f.get('diastolic', 0))
            hr = float(f.get('hr', 0))
            creatinine = float(f.get('creatinine', 1))
            na = float(f.get('na', 0))
            cl = float(f.get('cl', 0))
            hco3 = float(f.get('hco3', 0))
            qt = float(f.get('qt', 0))
            rr = float(f.get('rr', 1))
            albumin = float(f.get('albumin', 4))
            urine_na = float(f.get('urine_na', 0))
            urine_cr = float(f.get('urine_cr', 1))
            pao2 = float(f.get('pao2', 0))
            paco2 = float(f.get('paco2', 0))
            activity = float(f.get('activity', 1.2))

            eye = int(f.get('eye', 0))
            verbal = int(f.get('verbal', 0))
            motor = int(f.get('motor', 0))

            height_m = height / 100
            height_in = height / 2.54

            bmi = safe_div(weight, height_m ** 2)
            bsa = round(math.sqrt((height * weight) / 3600), 2)
            map_val = round((systolic + 2 * diastolic) / 3, 2)
            pp = systolic - diastolic
            bmr = round(
                10 * weight + 6.25 * height - 5 * age +
                (5 if gender == 'male' else -161), 2
            )

            gfr = round(
                175 * (creatinine ** -1.154) * (age ** -0.203) *
                (0.742 if gender == 'female' else 1), 2
            )

            crcl = round(
                ((140 - age) * weight) / (72 * creatinine) *
                (0.85 if gender == 'female' else 1), 2
            )

            agap = na - (cl + hco3)
            qtc = round(qt / math.sqrt(rr), 2) if rr > 0 else 'N/A'
            gcs = eye + verbal + motor

            ibw = round((50 if gender == 'male' else 45.5) + 2.3 * (height_in - 60), 2)
            abw = round(ibw + 0.4 * (weight - ibw), 2)
            calorie = round(bmr * activity, 2)
            shock_index = safe_div(hr, systolic)

            results = {
                "BMI": bmi,
                "Blood Pressure": f"{systolic}/{diastolic}",
                "MAP": map_val,
                "Pulse Pressure": pp,
                "BMR": bmr,
                "BSA": bsa,
                "GFR": gfr,
                "Creatinine Clearance": crcl,
                "Anion Gap": agap,
                "QTc Interval": qtc,
                "GCS Score": gcs,
                "Ideal Body Weight": ibw,
                "Adjusted Body Weight": abw,
                "Calorie Requirement": calorie,
                "Shock Index": shock_index
            }

        except Exception as e:
            results = {"Error": str(e)}

    return render_template('doctor_assistant.html', results=results)

@app.route('/physical-checkup', methods=['GET', 'POST'])
def physical_checkup():
    if request.method == 'POST':
        weight = float(request.form.get('weight', 0))
        height = float(request.form.get('height', 0))
        bp = request.form.get('bp', '')
        sugar = request.form.get('sugar', '')
        protein = int(request.form.get('protein', 0))
        water = float(request.form.get('water', 0))
        sleep = float(request.form.get('sleep', 0))
        walk = int(request.form.get('walk', 0))
        fruits = int(request.form.get('fruits', 0))
        junk = int(request.form.get('junk', 0))

        # BMI Calculation
        height_m = height / 100
        bmi = round(weight / (height_m ** 2), 2)

        if bmi < 18.5:
            bmi_status = "Underweight"
        elif bmi < 25:
            bmi_status = "Healthy"
        else:
            bmi_status = "Overweight"

        # Advice logic
        advice = "Maintain your current routine"

        if bmi > 25:
            advice = "Increase cardio exercise and reduce junk food"
        if sleep < 6:
            advice += ", improve sleep habits"
        if water < 2:
            advice += ", drink more water"

        session['physical_result'] = {
            'bmi': bmi,
            'bmi_status': bmi_status,
            'bp': bp,
            'sugar': sugar,
            'protein': protein,
            'water': water,
            'sleep': sleep,
            'walk': walk,
            'fruits': fruits,
            'junk': junk,
            'advice': advice
        }

        return redirect(url_for('physical_result'))

    return render_template('physical_checkup.html')


@app.route('/physical-result')
def physical_result():
    result = session.get('physical_result')
    if not result:
        return redirect(url_for('physical_checkup'))

    return render_template('physical_result.html', result=result)

@app.route('/mental-checkup', methods=['GET', 'POST'])
def mental_checkup():
    if request.method == 'POST':
        mood = int(request.form.get('mood', 5))
        anxiety = int(request.form.get('anxiety', 5))
        stress = int(request.form.get('stress', 5))
        sleep_quality = int(request.form.get('sleep_quality', 5))
        focus = int(request.form.get('focus', 5))
        energy = int(request.form.get('energy', 5))
        social = int(request.form.get('social', 5))
        screen_time = float(request.form.get('screen_time', 0))
        positivity = int(request.form.get('positivity', 5))
        relax_time = int(request.form.get('relax_time', 0))

        # Mental wellness calculation
        avg_score = (mood + sleep_quality + focus + energy + positivity) / 5

        if avg_score >= 7:
            mental_status = "Balanced"
        elif avg_score >= 4:
            mental_status = "Mildly Disturbed"
        else:
            mental_status = "Needs Attention"

        # Recommendation logic
        if avg_score < 4 or stress > 7 or anxiety > 7:
            recommendation = "Try deep breathing, guided meditation, and yoga nidra."
        elif screen_time > 6 or relax_time < 30:
            recommendation = "Reduce screen time and practice mindfulness or journaling."
        else:
            recommendation = "Maintain your current mental wellness routine."

        session['mental_result'] = {
            'mood': mood,
            'anxiety': anxiety,
            'stress': stress,
            'sleep_quality': sleep_quality,
            'focus': focus,
            'energy': energy,
            'social': social,
            'screen_time': screen_time,
            'positivity': positivity,
            'relax_time': relax_time,
            'mental_status': mental_status,
            'recommendation': recommendation
        }

        return redirect(url_for('mental_result'))

    return render_template('mental_checkup.html')


@app.route('/mental-result')
def mental_result():
    result = session.get('mental_result')
    if not result:
        return redirect(url_for('mental_checkup'))

    return render_template('mental_result.html', result=result)


@app.route('/dosage-calculator', methods=['GET', 'POST'])
def dosage_calculator():
    if request.method == 'POST':
        try:
            weight = float(request.form['weight'])
            age = int(request.form['age'])
            medicine = request.form['medicine'].strip().lower()

            dosage_mg = "Not Available"

            dosage_map = {
                "paracetamol": 15,
                "acetaminophen": 15,
                "ibuprofen": 10,
                "amoxicillin": 20,
                "azithromycin": 10,
                "diphenhydramine": 1,
                "loratadine": 0.2,
                "prednisolone": 1,
                "omeprazole": 1,
                "celecoxib": 3,
                "furosemide": 1,
                "hydroxyzine": 1,
                "levetiracetam": 10,
                "vancomycin": 15,
                "chlorpheniramine": 0.35,
                "phenytoin": 5,
                "dexamethasone": 0.15,
                "morphine": 0.1,
                "midazolam": 0.1,
                "ondansetron": 0.15,
                "ketamine": 1,
                "albendazole": 10,
                "salbutamol": 0.15,
                "ranitidine": 2,
                "betamethasone": 0.1,
                "lorazepam": 0.05,
                "fluconazole": 6,
                "valproate": 10,
                "aspirin": 10,
                "lansoprazole": 1,
                "metformin": 10,
                "phenobarbital": 3,
                "rifampicin": 15,
                "isoniazid": 10,
                "pyrazinamide": 25,
                "ethambutol": 20,
                "carbamazepine": 10,
                "diazepam": 0.3
            }

            if medicine in dosage_map:
                dosage_mg = round(dosage_map[medicine] * weight, 2)
            elif medicine == "cetirizine":
                dosage_mg = 5 if age < 12 else 10
            elif medicine == "montelukast":
                dosage_mg = 5
            elif medicine == "mebendazole":
                dosage_mg = 100

            session['dosage_result'] = {
                "weight": weight,
                "age": age,
                "medicine": medicine,
                "dosage_mg": dosage_mg
            }

            return redirect(url_for('dosage_result'))

        except Exception as e:
            return f"<h3 style='color:red'>Error: {e}</h3>"

    return render_template('dosage_calculator.html')


@app.route('/dosage-result')
def dosage_result():
    data = session.get('dosage_result')
    if not data:
        return redirect(url_for('dosage_calculator'))

    return render_template('dosage_result.html', data=data)


import os
from google import genai


# Set your Gemini API key
os.environ["GEMINI_API_KEY"] = "AIzaSyDY94Cbh_QEIocF2oyH6rMH3qu3Xmg0ON8"
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

@app.route('/medicine-recommendation', methods=['GET', 'POST'])
def medicine_recommendation():
    result = ""
    if request.method == 'POST':
        symptom = request.form['symptom'].lower()
        age = int(request.form['age'])
        weight = float(request.form['weight'])
        allergy = request.form['allergy'].lower()
        duration = request.form['duration']
        pregnancy = request.form.get('pregnancy', 'no').lower()

        try:
            # Query Gemini for a medicine suggestion
            prompt = (
                f"Suggest the most suitable over-the-counter medicine for: {symptom}. "
                f"Patient age: {age}, weight: {weight} kg, symptom duration: {duration}, "
                f"allergy: {allergy}, pregnancy: {pregnancy}. "
                "Give only the medicine name and short dosage advice."
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            recommendation = response.text.strip()

            # Allergy check
            if allergy != "none" and allergy in recommendation.lower():
                result = "⚠️ Your allergy condition conflicts with the recommended medicine. Consult a doctor."
            else:
                result = recommendation + f" (Suggested for {age} yrs, {weight} kg, symptom for {duration})"

        except Exception as e:
            result = f"Error: {str(e)}"

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Medicine Recommendation</title>
        <style>
            body {{
                font-family: 'Segoe UI', sans-serif;
                margin: 0;
                background: linear-gradient(135deg, #c2f2e9, #b2ebf2);
                overflow-x: hidden;
                text-align: center;
                animation: fadeIn 1s ease-in;
            }}
            .card {{
                background: white;
                margin: 30px auto;
                width: 75%;
                padding: 25px;
                border-radius: 16px;
                box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                animation: slideUp 0.8s ease;
            }}
            h1 {{ color: #00796b; }}
            label, input, select {{
                font-size: 18px;
                margin-top: 10px;
            }}
            input, select {{
                padding: 10px;
                width: 60%;
                border-radius: 10px;
                border: 1px solid #ccc;
                margin-bottom: 10px;
            }}
            button {{
                background-color: #00796b;
                color: white;
                padding: 12px 26px;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                cursor: pointer;
                transition: background 0.3s ease, transform 0.2s ease;
            }}
            button:hover {{
                background-color: #004d40;
                transform: scale(1.05);
            }}
            .result {{
                margin-top: 20px;
                font-size: 20px;
                color: #4a148c;
                font-weight: bold;
            }}
            a {{
                text-decoration: none;
                color: #00796b;
                font-weight: bold;
                display: inline-block;
                margin-top: 20px;
            }}
            @keyframes fadeIn {{
                from {{ opacity: 0; }}
                to {{ opacity: 1; }}
            }}
            @keyframes slideUp {{
                from {{ transform: translateY(20px); opacity: 0; }}
                to {{ transform: translateY(0); opacity: 1; }}
            }}
        </style>
    </head>
    <body>
        <div class="card">
            <h1>AI medicine recommendation system</h1>
            <form method="POST">
                <label for="symptom">Enter your symptom:</label><br>
                <input type="text" id="symptom" name="symptom" required><br>

                <label for="age">Enter your age:</label><br>
                <input type="number" id="age" name="age" required><br>

                <label for="weight">Enter your weight (kg):</label><br>
                <input type="number" step="0.1" id="weight" name="weight" required><br>

                <label for="duration">Duration of symptom (e.g., 2 days):</label><br>
                <input type="text" id="duration" name="duration" required><br>

                <label for="allergy">Any known medicine allergies? (Type medicine name or 'None'):</label><br>
                <input type="text" id="allergy" name="allergy" required><br>

                <label for="pregnancy">Pregnant? (if applicable):</label><br>
                <select id="pregnancy" name="pregnancy">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select><br><br>

                <button type="submit">Get Recommendation</button>
            </form>

            {"<div class='result'>Recommended Medicine: " + result + "</div>" if result else ""}
            <br>
            <a href="/">← Back to Home</a>
        </div>
    </body>
    </html>
    """




@app.route('/about')
def about():
    return render_template('about.html')



@app.route('/contact')
def contact():
    return render_template('contact.html')



@app.route('/blog')
def blog():
    return render_template('blog.html')




if __name__ == '__main__':  # Fixed: __name__ instead of _name_
    app.run(debug=True)
