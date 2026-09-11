import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.models import User, Doctor
from app.auth import hash_password
from app.routers import auth, patient, cases, doctor, sharing, chat

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MediMitra — AI-Assisted Multilingual Patient Case-Taking API",
    version="1.0.0",
    description="AI-Assisted Multilingual Patient Case-Taking Platform"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers directly (e.g. /auth/login, /cases/start)
app.include_router(auth.router)
app.include_router(patient.router)
app.include_router(cases.router)
app.include_router(doctor.router)
app.include_router(sharing.router)
app.include_router(chat.router)

# Also mount under /api prefix for unified reverse-proxy and Vercel serverless routing
api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(patient.router)
api_router.include_router(cases.router)
api_router.include_router(doctor.router)
api_router.include_router(sharing.router)
api_router.include_router(chat.router)

@app.get("/")
@api_router.get("/")
@api_router.get("")
def health_check():
    return {
        "status": "online",
        "platform": "MediMitra",
        "domain": "MedTech",
        "edition": "Enterprise MedTech 2026",
        "version": "1.0.0",
        "disclaimer": "MediMitra assists with information collection and clinical structuring. It does not provide medical diagnosis or treatment prescriptions."
    }

app.include_router(api_router)

def seed_demo_doctor():
    db = SessionLocal()
    try:
        demo_doc = db.query(User).filter(User.email == "dr.sharma@medimitra.health").first()
        if not demo_doc:
            doc_user = User(
                name="Dr. Rajesh Sharma, MD",
                email="dr.sharma@medimitra.health",
                password_hash=hash_password("Doctor@123"),
                role="doctor"
            )
            db.add(doc_user)
            db.commit()
            db.refresh(doc_user)

            doctor_profile = Doctor(
                user_id=doc_user.id,
                specialization="General Internal Medicine & Pulmonology",
                license_number="MCI-2026-8894",
                hospital="AIIMS Community Health Partner"
            )
            db.add(doctor_profile)
            db.commit()
    except Exception as e:
        print(f"Seed doctor notice: {e}")
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    seed_demo_doctor()
