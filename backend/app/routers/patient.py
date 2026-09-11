from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Patient, Consent, Case
from app.schemas import ConsentCreate, ConsentResponse, CaseDetailResponse
from app.auth import get_current_user

router = APIRouter(prefix="/patient", tags=["Patient"])

@router.post("/consent", response_model=ConsentResponse)
def give_consent(data: ConsentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    consent = Consent(
        patient_id=data.patient_id,
        consent_status=data.consent_status,
        consent_version=data.consent_version
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)
    return consent

@router.get("/consent/{patient_id}", response_model=ConsentResponse)
def get_active_consent(patient_id: int, db: Session = Depends(get_db)):
    consent = db.query(Consent).filter(Consent.patient_id == patient_id).order_by(Consent.id.desc()).first()
    if not consent:
        raise HTTPException(status_code=404, detail="No consent record found for this patient")
    return consent

@router.get("/cases", response_model=List[CaseDetailResponse])
def get_patient_cases(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.patient_profile:
        raise HTTPException(status_code=400, detail="User is not a patient")

    cases = db.query(Case).filter(Case.patient_id == current_user.patient_profile.id).order_by(Case.id.desc()).all()
    results = []
    for c in cases:
        results.append(CaseDetailResponse(
            id=c.id,
            patient_id=c.patient_id,
            chief_complaint=c.chief_complaint,
            status=c.status,
            created_at=c.created_at,
            updated_at=c.updated_at,
            clinical_record=c.clinical_record,
            red_flags=c.red_flags,
            responses_count=len(c.responses)
        ))
    return results
