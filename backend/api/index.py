import os
import sys
from pathlib import Path

# Add backend directory to sys.path for standalone backend deployment
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent

candidate_paths = [
    str(BACKEND_DIR),
    str(CURRENT_DIR),
    str(Path.cwd()),
    "/var/task"
]

for p in candidate_paths:
    if p not in sys.path and Path(p).exists():
        sys.path.insert(0, p)

from app.main import app, seed_demo_doctor

try:
    seed_demo_doctor()
except Exception as exc:
    print(f"Backend standalone serverless initialization note: {exc}")
