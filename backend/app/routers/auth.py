from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Patient, Doctor
from app.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    role = user_data.role.lower()
    if role not in ["patient", "doctor"]:
        role = "patient"

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    patient_id = None
    doctor_id = None

    if role == "patient":
        patient = Patient(
            user_id=new_user.id,
            age=user_data.age,
            gender=user_data.gender,
            preferred_language=user_data.preferred_language or "en"
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)
        patient_id = patient.id
    else:
        doctor = Doctor(
            user_id=new_user.id,
            specialization=user_data.specialization or "General Physician",
            license_number=user_data.license_number or "MED-2026-REG",

            hospital=user_data.hospital or "MediMitra Partner Clinic"
        )
        db.add(doctor)
        db.commit()
        db.refresh(doctor)
        doctor_id = doctor.id

    access_token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})

    user_resp = UserResponse(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role,
        patient_id=patient_id,
        doctor_id=doctor_id,
        preferred_language=user_data.preferred_language or "en"
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_resp)

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    patient_id = user.patient_profile.id if user.patient_profile else None
    doctor_id = user.doctor_profile.id if user.doctor_profile else None
    pref_lang = user.patient_profile.preferred_language if user.patient_profile else "en"

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})

    user_resp = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        patient_id=patient_id,
        doctor_id=doctor_id,
        preferred_language=pref_lang
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    patient_id = current_user.patient_profile.id if current_user.patient_profile else None
    doctor_id = current_user.doctor_profile.id if current_user.doctor_profile else None
    pref_lang = current_user.patient_profile.preferred_language if current_user.patient_profile else "en"

    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        patient_id=patient_id,
        doctor_id=doctor_id,
        preferred_language=pref_lang
    )
