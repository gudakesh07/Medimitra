from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Doctor, Case, AccessPermission, Patient
from app.schemas import DoctorInfo, ShareCaseRequest
from app.auth import get_current_user

router = APIRouter(prefix="/sharing", tags=["Patient-Doctor Sharing"])

@router.get("/doctors", response_model=List[DoctorInfo])
def list_available_doctors(db: Session = Depends(get_db)):
    doctors = db.query(Doctor).all()
    results = []
    for doc in doctors:
        results.append(DoctorInfo(
            id=doc.id,
            name=doc.user.name if doc.user else "Dr. Specialist",
            email=doc.user.email if doc.user else "",
            specialization=doc.specialization,
            hospital=doc.hospital
        ))
    return results

@router.post("/grant")
def grant_case_access(data: ShareCaseRequest, case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if current_user.patient_profile and case.patient_id != current_user.patient_profile.id:
        raise HTTPException(status_code=403, detail="You can only share your own patient case")

    # Check if permission already exists
    existing = db.query(AccessPermission).filter(
        AccessPermission.case_id == case_id,
        AccessPermission.doctor_id == data.doctor_id
    ).first()

    if existing:
        existing.access_status = "GRANTED"
        db.commit()
        return {"message": "Access permission renewed successfully", "permission_id": existing.id}

    perm = AccessPermission(
        patient_id=case.patient_id,
        doctor_id=data.doctor_id,
        case_id=case_id,
        access_status="GRANTED"
    )
    db.add(perm)
    case.status = "shared"
    db.commit()
    db.refresh(perm)

    return {"message": "Case successfully shared with doctor", "permission_id": perm.id}

@router.post("/revoke")
def revoke_case_access(doctor_id: int, case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    perm = db.query(AccessPermission).filter(
        AccessPermission.case_id == case_id,
        AccessPermission.doctor_id == doctor_id
    ).first()

    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")

    perm.access_status = "REVOKED"
    db.commit()

    return {"message": "Doctor access successfully revoked"}
