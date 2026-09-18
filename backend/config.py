from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "backend" / "database"
FRONTEND_DIR = BASE_DIR / "frontend"

# Clearance Hierarchy (Strict integer comparison: Public <= Internal <= Confidential <= Restricted)
CLEARANCE_LEVELS = {
    "Public": 0,
    "Internal": 1,
    "Confidential": 2,
    "Restricted": 3
}

# Default temporary password issued by company
COMPANY_TEMP_PASSWORD = "XYZ@2026"

# Server configuration
HOST = "127.0.0.1"
PORT = 8000

# Security boundary message for safe responses
SAFE_NO_ACCESS_RESPONSE = "I couldn't find an accessible document containing the requested information."
