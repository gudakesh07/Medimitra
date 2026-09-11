from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Doctor, Case, AccessPermission, AccessLog
from app.schemas import CaseDetailResponse
from app.auth import get_current_user

router = APIRouter(prefix="/doctor", tags=["Clinician Dashboard"])

@router.get("/dashboard")
def get_doctor_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.doctor_profile:
        raise HTTPException(status_code=403, detail="Access forbidden: Doctor role required")

    doctor = current_user.doctor_profile

    # Fetch permissions where access is granted
    permissions = db.query(AccessPermission).filter(
        AccessPermission.doctor_id == doctor.id,
        AccessPermission.access_status == "GRANTED"
    ).all()

    case_ids = [p.case_id for p in permissions]
    cases = db.query(Case).filter(Case.id.in_(case_ids)).order_by(Case.updated_at.desc()).all()

    red_flag_cases_count = 0
    formatted_cases = []
    
    for c in cases:
        has_red_flags = len(c.red_flags) > 0
        if has_red_flags:
            red_flag_cases_count += 1
            
        pat = c.patient
        user = pat.user if pat else None
        
        formatted_cases.append({
            "id": c.id,
            "patient_id": c.patient_id,
            "patient_name": user.name if user else "Anonymous",
            "patient_age": pat.age if pat else None,
            "patient_gender": pat.gender if pat else None,
            "patient_language": pat.preferred_language if pat else "en",
            "chief_complaint": c.chief_complaint,
            "status": c.status,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "red_flags": c.red_flags,
            "missing_info": c.clinical_record.missing_information if c.clinical_record else None,
            "summary": c.clinical_record.summary if c.clinical_record else None
        })

    return {
        "doctor_id": doctor.id,
        "doctor_name": current_user.name,
        "specialization": doctor.specialization,
        "hospital": doctor.hospital,
        "total_shared_patients": len(formatted_cases),
        "urgent_red_flag_cases": red_flag_cases_count,
        "cases": formatted_cases
    }

@router.get("/cases/{case_id}")
def get_shared_case_detail(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.doctor_profile:
        raise HTTPException(status_code=403, detail="Access forbidden: Doctor role required")

    doctor = current_user.doctor_profile

    permission = db.query(AccessPermission).filter(
        AccessPermission.doctor_id == doctor.id,
        AccessPermission.case_id == case_id,
        AccessPermission.access_status == "GRANTED"
    ).first()

    if not permission:
        raise HTTPException(status_code=403, detail="Doctor does not have active patient permission to view this case")

    # Record Access Audit Log (PRD Section 21.5)
    access_log = AccessLog(
        case_id=case_id,
        doctor_id=doctor.id,
        action="VIEW_FULL_CASE_SUMMARY"
    )
    db.add(access_log)
    db.commit()

    case = db.query(Case).filter(Case.id == case_id).first()
    pat = case.patient
    user = pat.user if pat else None

    return {
        "id": case.id,
        "patient_id": case.patient_id,
        "patient_name": user.name if user else "Anonymous",
        "patient_age": pat.age if pat else None,
        "patient_gender": pat.gender if pat else None,
        "patient_language": pat.preferred_language if pat else "en",
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
            for r in case.responses
        ]
    }
