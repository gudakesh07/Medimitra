from typing import List, Dict

def evaluate_red_flags(chief_complaint: str, responses: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """
    Evaluates patient responses against predefined attention rules.
    NOTE: Red flags do NOT diagnose disease or prescribe treatment.
    They prioritize cases requiring prompt clinician attention.
    """
    red_flags = []
    
    # Combine all textual information for contextual rule scanning
    full_text = chief_complaint.lower() + " " + " ".join([r.get("response_text", "").lower() for r in responses])

    # Rule 1: Cardiopulmonary / Severe Dyspnea
    if ("chest" in full_text and ("tight" in full_text or "pain" in full_text or "pressure" in full_text)) or \
       ("difficulty breathing at rest" in full_text or "severe breathlessness" in full_text):
        red_flags.append({
            "rule_id": "RF-01",
            "severity": "HIGH",
            "message": "⚠ Possible Red Flag: Potential cardiopulmonary distress or acute resting breathlessness reported."
        })

    # Rule 2: Prolonged High-Grade Fever with Rigors
    if ("fever" in full_text or "bukhar" in full_text) and \
       (("more than a week" in full_text or "103" in full_text or "chills" in full_text) and "shivering" in full_text):
        red_flags.append({
            "rule_id": "RF-02",
            "severity": "MODERATE",
            "message": "⚠ Possible Red Flag: Prolonged high-grade febrile illness with rigors requires priority clinician evaluation."
        })

    # Rule 3: Acute Abdomen / Intractable Vomiting
    if ("stomach" in full_text or "abdominal" in full_text or "pet" in full_text) and \
       ("severe acute pain" in full_text or "unable to keep fluids" in full_text or "lower right" in full_text):
        red_flags.append({
            "rule_id": "RF-03",
            "severity": "HIGH",
            "message": "⚠ Possible Red Flag: Severe acute abdominal pain or dehydration warning signs reported."
        })

    # Rule 4: Thunderclap Headache / Meningism
    if ("headache" in full_text or "sir dard" in full_text) and \
       ("thunderclap" in full_text or "neck stiffness" in full_text or ("severe" in full_text and "vomiting" in full_text)):
        red_flags.append({
            "rule_id": "RF-04",
            "severity": "HIGH",
            "message": "⚠ Possible Red Flag: Severe sudden-onset headache with associated neurological/meningeal warning signs."
        })

    # Rule 5: Hemoptysis (Blood in cough)
    if "blood" in full_text or "khoon" in full_text:
        red_flags.append({
            "rule_id": "RF-05",
            "severity": "HIGH",
            "message": "⚠ Possible Red Flag: Patient reported bleeding or hemoptysis."
        })

    return red_flags
