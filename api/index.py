import os
import sys
from pathlib import Path

# Resolve directory locations
CURRENT_DIR = Path(__file__).resolve().parent
ROOT_DIR = CURRENT_DIR.parent
BACKEND_DIR = ROOT_DIR / "backend"

# Ensure all plausible module paths are in sys.path for Vercel runtime
candidate_paths = [
    str(BACKEND_DIR),
    str(ROOT_DIR),
    str(CURRENT_DIR),
    str(Path.cwd() / "backend"),
    str(Path.cwd()),
    "/var/task/backend",
    "/var/task"
]

for p in candidate_paths:
    if p not in sys.path and Path(p).exists():
        sys.path.insert(0, p)

# Import the FastAPI application from app.main or backend.app.main
try:
    from app.main import app, seed_demo_doctor
except ImportError:
    from backend.app.main import app, seed_demo_doctor

# Trigger demo doctor seeding on serverless initialization
try:
    seed_demo_doctor()
except Exception as exc:
    print(f"Serverless initialization note: {exc}")
