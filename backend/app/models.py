import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="patient") # patient, doctor, admin
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    preferred_language = Column(String(20), default="en") # en, hi

    user = relationship("User", back_populates="patient_profile")
    consents = relationship("Consent", back_populates="patient")
    cases = relationship("Case", back_populates="patient")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    specialization = Column(String(100), default="General Physician")
    license_number = Column(String(50), nullable=True)
    hospital = Column(String(150), default="Community Health Center")

    user = relationship("User", back_populates="doctor_profile")
    access_permissions = relationship("AccessPermission", back_populates="doctor")

class Consent(Base):
    __tablename__ = "consents"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    consent_status = Column(Boolean, default=True)
    consent_version = Column(String(20), default="1.0")
    consent_timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="consents")

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    chief_complaint = Column(String(255), nullable=True)
    status = Column(String(50), default="in_progress") # in_progress, reviewed, shared, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="cases")
    responses = relationship("PatientResponse", back_populates="case", cascade="all, delete-orphan")
    clinical_record = relationship("ClinicalRecord", back_populates="case", uselist=False, cascade="all, delete-orphan")
    red_flags = relationship("RedFlag", back_populates="case", cascade="all, delete-orphan")
    permissions = relationship("AccessPermission", back_populates="case", cascade="all, delete-orphan")
    access_logs = relationship("AccessLog", back_populates="case", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), index=True) # fever, cough, headache, abdominal_pain, general
    question_text_en = Column(Text, nullable=False)
    question_text_hi = Column(Text, nullable=False)
    language = Column(String(20), default="en")
    required_field = Column(String(50), nullable=True) # duration, severity, medications, allergies, etc.

class PatientResponse(Base):
    __tablename__ = "patient_responses"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    question_text = Column(Text, nullable=True)
    response_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("Case", back_populates="responses")

class ClinicalRecord(Base):
    __tablename__ = "clinical_records"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), unique=True)
    chief_complaint = Column(String(255), nullable=True)
    duration = Column(String(100), nullable=True)
    symptoms = Column(Text, nullable=True) # JSON or structured string
    medical_history = Column(Text, nullable=True)
    medication_history = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    missing_information = Column(Text, nullable=True)
    key_findings = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)

    case = relationship("Case", back_populates="clinical_record")

class RedFlag(Base):
    __tablename__ = "red_flags"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    rule_id = Column(String(50))
    severity = Column(String(20), default="HIGH") # HIGH, MODERATE
    status = Column(String(20), default="ACTIVE")
    message = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("Case", back_populates="red_flags")

class AccessPermission(Base):
    __tablename__ = "access_permissions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    case_id = Column(Integer, ForeignKey("cases.id"))
    access_status = Column(String(20), default="GRANTED") # GRANTED, REVOKED
    granted_at = Column(DateTime, default=datetime.datetime.utcnow)

    doctor = relationship("Doctor", back_populates="access_permissions")
    case = relationship("Case", back_populates="permissions")

class AccessLog(Base):
    __tablename__ = "access_logs"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    action = Column(String(50), default="VIEW_CASE")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("Case", back_populates="access_logs")
