import sys
import webbrowser
import threading
import time
from pathlib import Path

# Fix Windows console UTF-8 output
sys.stdout.reconfigure(encoding="utf-8")

def open_browser():
    time.sleep(1.2)
    url = "http://127.0.0.1:8000"
    print(f"\n🚀 Launching Sentinel Research in default browser: {url}")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Notice: Open {url} manually in your browser.")

if __name__ == "__main__":
    import uvicorn
    
    print("""
========================================================================
   🛡️  SENTINEL RESEARCH - SECURE ENTERPRISE INTELLIGENCE PROTOTYPE
   Problem: "The Employee Who Asked For Too Much"
   Core Rule: "The AI must never receive or process the content of a
               document that the requesting employee is not authorized to access."
========================================================================

📍 Access Web Interface: http://127.0.0.1:8000

👥 Demo Accounts (Default Password: XYZ@2026):
  1. U102 (Finance / Finance / Internal)        -> Test Case A (₹120 crore)
  2. U205 (Marketing / Marketing / Internal)    -> Test Case B (Blocked before AI)
  3. U301 (Finance / Finance / Internal)        -> Test Case C (Version Conflict -> ₹125 crore)
  4. A901 (Executive / Executive / Restricted)  -> Admin Compliance Ledger

⚡ Quick Hackathon Presets are built directly into the UI!
========================================================================
""")
    
    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False, log_level="info")
