from typing import List, Dict, Any

def generate_clinical_summary(chief_complaint: str, responses: List[Dict[str, Any]], red_flags: List[Dict[str, str]]) -> Dict[str, Any]:
    duration = "Not reported"
    symptoms = []
    medication = "None reported"
    allergies = "Not reported"
    missing_fields = []
    
    # Map questions/responses to clinical slots
    for r in responses:
        text = r.get("response_text", "").strip()
        q_text = r.get("question_text", "").lower()
        
        if "how many days" in q_text or "how long" in q_text or "कब से" in q_text or "कितने दिनों" in q_text or "when did" in q_text:
            duration = text
        elif "temperature" in q_text or "तापमान" in q_text or "dry or productive" in q_text or "where is the pain" in q_text or "which part" in q_text:
            symptoms.append(text)
        elif "associated symptoms" in q_text or "लक्षण" in q_text or "difficulty breathing" in q_text:
            if "none" not in text.lower():
                symptoms.append(text)
        elif "medication" in q_text or "दवाई" in q_text or "cough syrup" in q_text or "pain relievers" in q_text or "antacid" in q_text:
            medication = text
        elif "allergies" in q_text or "एलर्जी" in q_text or "asthma" in q_text or "chronic" in q_text:
            allergies = text

    # Missing information detection
    if duration == "Not reported":
        missing_fields.append("Symptom onset/duration requires clarification")
    if allergies == "Not reported" or "haven't" in allergies.lower():
        missing_fields.append("Drug allergy and chronic history unverified")
    if medication == "None reported":
        missing_fields.append("Confirm whether any OTC medications or remedies were taken")
    
    symptoms_str = ", ".join(symptoms) if symptoms else "Primary chief complaint only"
    missing_str = "; ".join(missing_fields) if missing_fields else "All standard intake fields addressed"
    
    red_flags_str = "; ".join([f["message"] for f in red_flags]) if red_flags else "None reported"

    summary_text = (
        f"PATIENT CASE SUMMARY\n"
        f"Chief Complaint: {chief_complaint}\n"
        f"Duration / Timeline: {duration}\n"
        f"Key Symptoms & Features: {symptoms_str}\n"
        f"Medication History: {medication}\n"
        f"Allergies / Past Conditions: {allergies}\n"
        f"Missing Information: {missing_str}\n"
        f"Possible Red Flags: {red_flags_str}\n"
    )

    return {
        "chief_complaint": chief_complaint,
        "duration": duration,
        "symptoms": symptoms_str,
        "medication_history": medication,
        "allergies": allergies,
        "missing_information": missing_str,
        "key_findings": f"Intake completed with {len(responses)} structured inquiries.",
        "summary": summary_text
    }
