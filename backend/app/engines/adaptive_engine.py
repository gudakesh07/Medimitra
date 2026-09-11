import re
from typing import Dict, List, Optional, Tuple

QUESTION_BANK = {
    "fever": [
        {
            "id": 101,
            "field": "duration",
            "en": "How many days have you had the fever?",
            "hi": "आपको बुखार कितने दिनों से है?",
            "options": ["1-2 days", "3-5 days", "More than a week"]
        },
        {
            "id": 102,
            "field": "temperature",
            "en": "Do you know your recorded temperature or does it feel high with chills/shivering?",
            "hi": "क्या आपने तापमान मापा है, या ठंड/कंपकंपी के साथ तेज बुखार महसूस होता है?",
            "options": ["Mild (under 100°F)", "High (101°F - 103°F)", "Very High (>103°F) with chills", "Haven't measured"]
        },
        {
            "id": 103,
            "field": "associated_symptoms",
            "en": "Do you have any associated symptoms such as cough, body ache, sore throat, or headache?",
            "hi": "क्या आपको खांसी, बदन दर्द, गले में खराश या सिरदर्द जैसे लक्षण भी हैं?",
            "options": ["Cough & Cold", "Severe Body Ache", "Sore Throat", "None of these"]
        },
        {
            "id": 104,
            "field": "medication_history",
            "en": "Have you taken any medication for the fever (e.g., Paracetamol, Dolo)?",
            "hi": "क्या आपने बुखार के लिए कोई दवाई ली है (जैसे पैरासिटामोल, डोलो)?",
            "options": ["Yes, Paracetamol/Dolo", "Yes, other home remedy", "No medication taken"]
        },
        {
            "id": 105,
            "field": "allergies",
            "en": "Do you have any known drug allergies or chronic medical conditions?",
            "hi": "क्या आपको किसी दवा से एलर्जी है या कोई पुरानी बीमारी है?",
            "options": ["No known allergies", "Allergic to Penicillin/Sulfa", "Diabetic / Hypertensive", "Other"]
        }
    ],
    "cough": [
        {
            "id": 201,
            "field": "duration",
            "en": "How long have you had this cough?",
            "hi": "आपको यह खांसी कब से है?",
            "options": ["Few days (1-3 days)", "About a week", "More than 2 weeks"]
        },
        {
            "id": 202,
            "field": "symptom_type",
            "en": "Is the cough dry or productive with phlegm/mucus?",
            "hi": "क्या खांसी सूखी है या बलगम वाली?",
            "options": ["Dry cough", "Productive (with yellow/green phlegm)", "With clear mucus"]
        },
        {
            "id": 203,
            "field": "breathing_difficulty",
            "en": "Are you having any difficulty breathing, wheezing, or chest tightness?",
            "hi": "क्या आपको सांस लेने में कठिनाई, घरघराहट या सीने में जकड़न महसूस हो रही है?",
            "options": ["No breathing trouble", "Mild breathlessness on walking", "Difficulty breathing at rest / tight chest"]
        },
        {
            "id": 204,
            "field": "medication_history",
            "en": "Have you taken any cough syrup, inhaler, or medicines?",
            "hi": "क्या आपने कोई कफ सिरप, इनहेलर या दवाई ली है?",
            "options": ["Yes, cough syrup", "Yes, inhaler", "No medications"]
        },
        {
            "id": 205,
            "field": "allergies",
            "en": "Do you have asthma, smoking history, or any known drug allergies?",
            "hi": "क्या आपको अस्थमा है, धूम्रपान करते हैं, या कोई दवा एलर्जी है?",
            "options": ["No allergies / Non-smoker", "History of Asthma", "Smoker", "Known drug allergies"]
        }
    ],
    "headache": [
        {
            "id": 301,
            "field": "duration",
            "en": "How long has the headache lasted, and did it start suddenly?",
            "hi": "सिरदर्द कब से है और क्या यह अचानक बहुत तेजी से शुरू हुआ था?",
            "options": ["Started today gradually", "Severe sudden onset (thunderclap)", "Recurring for weeks", "Last 2-3 days"]
        },
        {
            "id": 302,
            "field": "location_and_type",
            "en": "Where is the pain located (forehead, one-sided, back of head) and what type of pain is it?",
            "hi": "दर्द कहां पर है (माथा, एक तरफ, सिर का पिछला हिस्सा) और किस तरह का दर्द है?",
            "options": ["Throbbing on one side", "Dull band around whole forehead", "Back of head / neck stiffness", "Sinus / eye pressure"]
        },
        {
            "id": 303,
            "field": "associated_symptoms",
            "en": "Do you have nausea, vomiting, sensitivity to light, or fever with the headache?",
            "hi": "क्या सिरदर्द के साथ जी मिचलाना, उल्टी, रोशनी से परेशानी या बुखार है?",
            "options": ["Nausea / Light sensitivity", "Fever and neck stiffness", "None of these"]
        },
        {
            "id": 304,
            "field": "medication_history",
            "en": "Have you taken any pain relievers (like Ibuprofen, Paracetamol)?",
            "hi": "क्या आपने कोई दर्द निवारक दवा ली है?",
            "options": ["Yes, took painkiller", "No medicines taken"]
        },
        {
            "id": 305,
            "field": "allergies",
            "en": "Any history of migraine, high blood pressure, or drug allergies?",
            "hi": "क्या आपको माइग्रेन, हाई ब्लड प्रेशर या किसी दवा से एलर्जी का इतिहास है?",
            "options": ["History of Migraine", "High Blood Pressure", "No prior medical conditions"]
        }
    ],
    "abdominal_pain": [
        {
            "id": 401,
            "field": "duration",
            "en": "When did the stomach pain start and how severe is it?",
            "hi": "पेट दर्द कब शुरू हुआ और कितना तेज है?",
            "options": ["Started recently, mild cramping", "Severe acute pain", "On and off for days"]
        },
        {
            "id": 402,
            "field": "location",
            "en": "Which part of the abdomen hurts the most (upper, lower right, around navel)?",
            "hi": "पेट के किस हिस्से में सबसे ज्यादा दर्द है (ऊपर, निचला दायां हिस्सा, नाभि के पास)?",
            "options": ["Upper stomach (acidity / burning)", "Lower right abdomen", "Lower central abdomen", "Generalized cramping"]
        },
        {
            "id": 403,
            "field": "associated_symptoms",
            "en": "Do you have vomiting, diarrhea, constipation, or fever?",
            "hi": "क्या आपको उल्टी, दस्त, कब्ज या बुखार है?",
            "options": ["Vomiting / Unable to keep fluids", "Loose stools / Diarrhea", "Fever", "None"]
        },
        {
            "id": 404,
            "field": "medication_history",
            "en": "Have you taken antacids or antispasmodic tablets?",
            "hi": "क्या आपने एंटासिड या पेट दर्द की गोली ली है?",
            "options": ["Yes, antacid (gelusil/pantocid)", "No medications taken"]
        },
        {
            "id": 405,
            "field": "allergies",
            "en": "Do you have any food/drug allergies, or previous surgeries/gallbladder issues?",
            "hi": "क्या आपको किसी भोजन/दवा से एलर्जी है, या कोई पिछली सर्जरी हुई है?",
            "options": ["No history/allergies", "Lactose intolerant", "Known drug allergy"]
        }
    ],
    "general": [
        {
            "id": 501,
            "field": "duration",
            "en": "How long have you been feeling unwell or experiencing this issue?",
            "hi": "आप कितने समय से अस्वस्थ महसूस कर रहे हैं?",
            "options": ["1-3 days", "About a week", "More than 2 weeks"]
        },
        {
            "id": 502,
            "field": "severity",
            "en": "On a scale from mild to severe, how much is this affecting your daily activities?",
            "hi": "हल्के से गंभीर के पैमाने पर, यह आपकी दैनिक गतिविधियों को कितना प्रभावित कर रहा है?",
            "options": ["Mild - able to work", "Moderate - uncomfortable", "Severe - bedridden"]
        },
        {
            "id": 503,
            "field": "associated_symptoms",
            "en": "Are you experiencing any other symptoms like weakness, fever, nausea, or dizziness?",
            "hi": "क्या आपको कमजोरी, बुखार, जी मिचलाना या चक्कर आने जैसे अन्य लक्षण भी हैं?",
            "options": ["Extreme weakness/fatigue", "Dizziness", "Mild fever", "None"]
        },
        {
            "id": 504,
            "field": "medication_history",
            "en": "Are you currently taking any prescription medications or home remedies?",
            "hi": "क्या आप वर्तमान में कोई दवाइयां या घरेलू नुस्खे ले रहे हैं?",
            "options": ["Yes, taking regular medicines", "No medications taken"]
        },
        {
            "id": 505,
            "field": "allergies",
            "en": "Do you have any known medical conditions or drug allergies?",
            "hi": "क्या आपको कोई पुरानी बीमारी या दवाओं से एलर्जी है?",
            "options": ["No known allergies", "Known drug allergy", "Chronic condition (BP/Diabetes)"]
        }
    ]
}

def detect_category(chief_complaint: str) -> str:
    text = chief_complaint.lower()
    if any(w in text for w in ["fever", "bukhar", "temperature", "tapman", "chills", "garam"]):
        return "fever"
    if any(w in text for w in ["cough", "khansi", "phlegm", "balgam", "sore throat", "gala", "breath"]):
        return "cough"
    if any(w in text for w in ["headache", "head pain", "sir dard", "sar dard", "migraine", "cephalea"]):
        return "headache"
    if any(w in text for w in ["stomach", "pet", "abdominal", "abdomen", "belly", "cramp", "gastric"]):
        return "abdominal_pain"
    return "general"

def get_next_question(category: str, answered_count: int, language: str = "en") -> Optional[Dict]:
    questions = QUESTION_BANK.get(category, QUESTION_BANK["general"])
    if answered_count >= len(questions):
        return None # All questions completed

    q = questions[answered_count]
    lang_key = "hi" if language == "hi" else "en"
    return {
        "question_id": q["id"],
        "category": category,
        "question_text": q[lang_key],
        "language": language,
        "required_field": q["field"],
        "options": q.get("options", []),
        "is_terminal": (answered_count == len(questions) - 1)
    }
