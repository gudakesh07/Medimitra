from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Case, Patient, PatientResponse, ClinicalRecord, RedFlag, User
from app.schemas import StartCaseRequest, SubmitResponseRequest, CaseDetailResponse, ClinicalRecordResponse, RedFlagItem
from app.engines.adaptive_engine import detect_category, get_next_question
from app.engines.red_flag_engine import evaluate_red_flags
from app.engines.summary_engine import generate_clinical_summary
from app.auth import get_current_user

router = APIRouter(prefix="/cases", tags=["Case Taking"])

@router.post("/start")
def start_case(data: StartCaseRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    category = detect_category(data.initial_complaint)
    
    new_case = Case(
        patient_id=data.patient_id,
        chief_complaint=data.initial_complaint,
        status="in_progress"
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    # Initial response record for the chief complaint
    initial_resp = PatientResponse(
        case_id=new_case.id,
        question_text="What brings you here today? / आज आपकी क्या समस्या है?",
        response_text=data.initial_complaint
    )
    db.add(initial_resp)
    db.commit()

    # Get first adaptive question
    first_q = get_next_question(category, answered_count=0, language=data.language)

    return {
        "case_id": new_case.id,
        "category": category,
        "chief_complaint": data.initial_complaint,
        "next_question": first_q
    }

@router.post("/response")
def submit_response(data: SubmitResponseRequest, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == data.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Record patient response
    response_entry = PatientResponse(
        case_id=case.id,
        question_id=data.question_id,
        question_text=data.question_text,
        response_text=data.response_text
    )
    db.add(response_entry)
    db.commit()

    # Fetch all responses so far
    all_responses = db.query(PatientResponse).filter(PatientResponse.case_id == case.id).all()
    resp_dicts = [{"question_text": r.question_text, "response_text": r.response_text} for r in all_responses]

    # Evaluate Red Flags
    detected_flags = evaluate_red_flags(case.chief_complaint or "", resp_dicts)
    existing_rule_ids = {rf.rule_id for rf in case.red_flags}
    
    for flag in detected_flags:
        if flag["rule_id"] not in existing_rule_ids:
            new_rf = RedFlag(
                case_id=case.id,
                rule_id=flag["rule_id"],
                severity=flag["severity"],
                status="ACTIVE",
                message=flag["message"]
            )
            db.add(new_rf)
    db.commit()

    # Get next adaptive question
    # Note: subtracting 1 because first response was chief complaint
    answered_count = max(0, len(all_responses) - 1)
    category = detect_category(case.chief_complaint or "")
    
    # Determine language from patient preference
    language = case.patient.preferred_language if case.patient else "en"
    next_q = get_next_question(category, answered_count=answered_count, language=language)

    if next_q is None:
        case.status = "intake_completed"
        db.commit()

    return {
        "case_id": case.id,
        "is_completed": next_q is None,
        "next_question": next_q,
        "red_flags": [RedFlagItem.from_orm(rf) for rf in case.red_flags]
    }

@router.post("/{case_id}/generate-summary", response_model=ClinicalRecordResponse)
def generate_summary(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    responses = db.query(PatientResponse).filter(PatientResponse.case_id == case.id).all()
    resp_dicts = [{"question_text": r.question_text, "response_text": r.response_text} for r in responses]
    red_flag_dicts = [{"rule_id": rf.rule_id, "message": rf.message} for rf in case.red_flags]

    summary_data = generate_clinical_summary(case.chief_complaint or "General consultation", resp_dicts, red_flag_dicts)

    clinical_record = case.clinical_record
    if not clinical_record:
        clinical_record = ClinicalRecord(case_id=case.id)
        db.add(clinical_record)

    clinical_record.chief_complaint = summary_data["chief_complaint"]
    clinical_record.duration = summary_data["duration"]
    clinical_record.symptoms = summary_data["symptoms"]
    clinical_record.medication_history = summary_data["medication_history"]
    clinical_record.allergies = summary_data["allergies"]
    clinical_record.missing_information = summary_data["missing_information"]
    clinical_record.key_findings = summary_data["key_findings"]
    clinical_record.summary = summary_data["summary"]

    case.status = "reviewed"
    db.commit()
    db.refresh(clinical_record)

    return clinical_record

@router.get("/{case_id}", response_model=Dict[str, Any])
def get_case_details(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    patient = case.patient
    user = patient.user if patient else None

    responses = db.query(PatientResponse).filter(PatientResponse.case_id == case.id).order_by(PatientResponse.id.asc()).all()

    return {
        "id": case.id,
        "patient_id": case.patient_id,
        "patient_name": user.name if user else "Anonymous",
        "patient_age": patient.age if patient else None,
        "patient_gender": patient.gender if patient else None,
        "patient_language": patient.preferred_language if patient else "en",
        "chief_complaint": case.chief_complaint,
        "status": case.status,
        "created_at": case.created_at,
        "updated_at": case.updated_at,
        "clinical_record": case.clinical_record,
        "red_flags": case.red_flags,
        "responses": [
            {
                "id": r.id,
                "question_text": r.question_text,
                "response_text": r.response_text,
                "created_at": r.created_at
            }
            for r in responses
        ]
    }

@router.get("/{case_id}/fhir")
def export_case_fhir(case_id: int, db: Session = Depends(get_db)):
    """
    Exports structured case data into HL7 FHIR-compliant JSON resources.
    Conforms to PRD Section 22 Interoperability requirement.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    patient = case.patient
    user = patient.user if patient else None
    rec = case.clinical_record

    # FHIR Patient Resource
    fhir_patient = {
        "resourceType": "Patient",
        "id": f"pat-{patient.id if patient else 'unknown'}",
        "name": [{"use": "official", "text": user.name if user else "Patient"}],
        "gender": (patient.gender or "unknown").lower(),
        "extension": [
            {
                "url": "https://medimitra.health/fhir/preferred-language",
                "valueString": patient.preferred_language if patient else "en"
            }
        ]
    }

    # FHIR Encounter Resource
    fhir_encounter = {
        "resourceType": "Encounter",
        "id": f"enc-{case.id}",
        "status": "planned" if case.status != "reviewed" else "finished",
        "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB",
            "display": "ambulatory"
        },
        "subject": {"reference": f"Patient/pat-{patient.id if patient else '0'}"},
        "reasonCode": [{"text": case.chief_complaint or "Intake consultation"}]
    }

    # FHIR Condition Resource
    fhir_condition = {
        "resourceType": "Condition",
        "id": f"cond-{case.id}",
        "clinicalStatus": {
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                "code": "active"
            }]
        },
        "verificationStatus": {
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                "code": "unconfirmed"
            }]
        },
        "subject": {"reference": f"Patient/pat-{patient.id if patient else '0'}"},
        "code": {"text": case.chief_complaint or "Unspecified concern"},
        "onsetAge": {"value": patient.age if patient and patient.age else None, "unit": "years"}
    }

    # FHIR Observations for Symptoms and Red Flags
    observations = []
    if rec and rec.symptoms:
        observations.append({
            "resourceType": "Observation",
            "id": f"obs-symp-{case.id}",
            "status": "preliminary",
            "category": [{
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    "code": "symptom"
                }]
            }],
            "code": {"text": "Reported Intake Symptoms"},
            "valueString": rec.symptoms
        })

    for i, rf in enumerate(case.red_flags):
        observations.append({
            "resourceType": "Observation",
            "id": f"obs-rf-{case.id}-{i}",
            "status": "preliminary",
            "category": [{
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    "code": "exam"
                }]
            }],
            "code": {"text": f"Triage Alert: {rf.rule_id}"},
            "valueString": rf.message,
            "interpretation": [{
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                    "code": "A",
                    "display": "Abnormal / Critical Attention Required"
                }]
            }]
        })

    bundle_entries = [
        {"fullUrl": f"urn:uuid:pat-{patient.id if patient else '0'}", "resource": fhir_patient},
        {"fullUrl": f"urn:uuid:enc-{case.id}", "resource": fhir_encounter},
        {"fullUrl": f"urn:uuid:cond-{case.id}", "resource": fhir_condition},
    ]

    for obs in observations:
        bundle_entries.append({"fullUrl": f"urn:uuid:{obs['id']}", "resource": obs})

    return {
        "resourceType": "Bundle",
        "type": "collection",
        "timestamp": case.created_at.isoformat(),
        "total": len(bundle_entries),
        "entry": bundle_entries
    }
