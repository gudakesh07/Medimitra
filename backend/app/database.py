import os
import shutil
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Determine appropriate DATABASE_URL
env_db_url = os.getenv("DATABASE_URL")

if env_db_url:
    # Fix SQLAlchemy 1.4+ compatibility for postgres URLs (postgres:// -> postgresql://)
    if env_db_url.startswith("postgres://"):
        env_db_url = env_db_url.replace("postgres://", "postgresql://", 1)
    DATABASE_URL = env_db_url
elif os.getenv("VERCEL"):
    # On Vercel serverless functions, the root filesystem is read-only.
    # We use /tmp/medimitra.db for SQLite so writes succeed.
    tmp_db = Path("/tmp/medimitra.db")
    
    # Try copying existing pre-seeded SQLite database from backend directory if it exists
    if not tmp_db.exists():
        possible_sources = [
            Path(__file__).resolve().parent.parent / "medimitra.db",
            Path("/var/task/backend/medimitra.db"),
            Path("/var/task/medimitra.db"),
            Path.cwd() / "backend" / "medimitra.db",
            Path.cwd() / "medimitra.db",
            Path("./backend/medimitra.db"),
            Path("./medimitra.db")
        ]
        for src in possible_sources:
            if src.exists() and src.is_file():
                try:
                    shutil.copyfile(src, tmp_db)
                    break
                except Exception:
                    pass
    DATABASE_URL = f"sqlite:///{tmp_db}"
else:
    DATABASE_URL = "sqlite:///./medimitra.db"

# SQLite needs connect_args for multithreading
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
