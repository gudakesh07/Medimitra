from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str = "patient" # "patient" or "doctor"
    # Optional fields based on role
    age: Optional[int] = None
    gender: Optional[str] = None
    preferred_language: Optional[str] = "en"
    specialization: Optional[str] = "General Physician"
    license_number: Optional[str] = None
    hospital: Optional[str] = "Community Health Center"

class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    preferred_language: Optional[str] = "en"

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Consent Schemas ---
class ConsentCreate(BaseModel):
    patient_id: int
    consent_status: bool = True
    consent_version: str = "1.0"

class ConsentResponse(BaseModel):
    id: int
    patient_id: int
    consent_status: bool
    consent_version: str
    consent_timestamp: datetime

    class Config:
        from_attributes = True

# --- Case & Question Schemas ---
class StartCaseRequest(BaseModel):
    patient_id: int
    initial_complaint: str
    language: str = "en" # "en" or "hi"

class QuestionItem(BaseModel):
    question_id: int
    category: str
    question_text: str
    language: str
    required_field: Optional[str] = None
    options: Optional[List[str]] = None
    is_terminal: bool = False

class SubmitResponseRequest(BaseModel):
    case_id: int
    question_id: Optional[int] = None
    question_text: str
    response_text: str

class RedFlagItem(BaseModel):
    id: Optional[int] = None
    rule_id: str
    severity: str
    message: str

    class Config:
        from_attributes = True

class ClinicalRecordResponse(BaseModel):
    chief_complaint: Optional[str] = None
    duration: Optional[str] = None
    symptoms: Optional[str] = None
    medical_history: Optional[str] = None
    medication_history: Optional[str] = None
    allergies: Optional[str] = None
    missing_information: Optional[str] = None
    key_findings: Optional[str] = None
    summary: Optional[str] = None

    class Config:
        from_attributes = True

class CaseDetailResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    chief_complaint: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    clinical_record: Optional[ClinicalRecordResponse] = None
    red_flags: List[RedFlagItem] = []
    responses_count: int = 0

    class Config:
        from_attributes = True

# --- Sharing Schemas ---
class ShareCaseRequest(BaseModel):
    doctor_id: int

class DoctorInfo(BaseModel):
    id: int
    name: str
    email: str
    specialization: str
    hospital: str

class AccessPermissionResponse(BaseModel):
    id: int
    doctor_id: int
    case_id: int
    access_status: str
    granted_at: datetime
    doctor_name: Optional[str] = None
    doctor_specialization: Optional[str] = None

# --- FHIR Export Schemas ---
class FHIRResource(BaseModel):
    resourceType: str
    id: str

    model_config = {"extra": "allow"}

class FHIRBundle(BaseModel):
    resourceType: str = "Bundle"
    type: str = "collection"
    entry: List[Dict[str, Any]]

