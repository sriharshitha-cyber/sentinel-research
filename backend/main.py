import os
from typing import Optional, List
from pathlib import Path
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from .config import FRONTEND_DIR
from .database.db_service import DatabaseService
from .models.employee import (
    LoginRequest,
    PasswordChangeRequest,
    ProfileVerificationRequest,
    EmployeePublicProfile
)
from .models.audit import QueryRequest, QueryResponse
from .pipeline import SentinelPipeline

app = FastAPI(
    title="Sentinel Research - Enterprise AI Intelligence Platform",
    description="Deterministic Pre-LLM Authorization & Multi-Agent Security Engine",
    version="2.0.0"
)

# Enable CORS for local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared services
db_service = DatabaseService()
pipeline = SentinelPipeline(db_service)

# API Endpoints
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Sentinel Research API",
        "security_policy": "Deterministic Pre-LLM Authorization Gate Active"
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    success, employee, msg = db_service.verify_credentials(req.identifier, req.password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=msg
        )
    return {
        "success": True,
        "message": msg,
        "employee": EmployeePublicProfile(
            employee_id=employee.employee_id,
            name=employee.name,
            email=employee.email,
            department=employee.department,
            role=employee.role,
            clearance=employee.clearance,
            status=employee.status,
            must_change_password=employee.must_change_password,
            is_admin=employee.is_admin,
            is_manager=employee.is_manager
        )
    }

@app.post("/api/auth/change-password")
def change_password(req: PasswordChangeRequest):
    if len(req.new_password.strip()) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")
    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="New password and confirmation do not match.")
    
    updated = db_service.update_password(req.employee_id, req.new_password)
    if not updated:
        raise HTTPException(status_code=404, detail="Employee record not found.")
    
    return {"success": True, "message": "Password successfully updated. Temporary credential cleared."}

@app.post("/api/auth/verify-claimed-profile")
def verify_claimed_profile(req: ProfileVerificationRequest):
    timeline = []
    success, res = pipeline.identity_agent.cross_check_claimed_profile(
        employee_id=req.employee_id,
        claimed_department=req.claimed_department,
        claimed_role=req.claimed_role,
        timeline=timeline
    )
    if not success:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "mismatch": True,
                "error": res["error"],
                "mismatches": res.get("mismatches", []),
                "official_department": res.get("official_department"),
                "official_role": res.get("official_role")
            }
        )
    return {"success": True, "mismatch": False, "message": "Profile verified against Company Employee Directory."}

@app.get("/api/employees", response_model=List[EmployeePublicProfile])
def list_employees():
    return db_service.get_all_employees()

@app.get("/api/documents")
def list_documents(user_id: Optional[str] = None):
    # Returns documents overview with classifications
    docs = db_service.get_all_documents()
    res = []
    for d in docs:
        res.append({
            "document_id": d.document_id,
            "title": d.title,
            "classification": d.classification,
            "allowed_departments": d.allowed_departments,
            "allowed_roles": d.allowed_roles,
            "version": d.version,
            "effective_date": d.effective_date,
            "status": d.status,
            "summary": d.summary
        })
    return res

@app.post("/api/query", response_model=QueryResponse)
def run_query(req: QueryRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    return pipeline.execute_query(user_id=req.user_id, question=req.question)

@app.get("/api/audit")
def get_audit_logs(
    user_id: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    records = db_service.get_audit_records()
    filtered = []
    for r in records:
        if user_id and r.get("user_id", "").lower() != user_id.lower():
            continue
        if department and department.lower() != "all" and r.get("department", "").lower() != department.lower():
            continue
        if status and status.lower() != "all" and r.get("status", "").lower() != status.lower():
            continue
        if search:
            search_str = f"{r.get('request_id')} {r.get('question')} {r.get('user_id')} {r.get('answer')}".lower()
            if search.lower() not in search_str:
                continue
        filtered.append(r)
    return filtered

@app.get("/api/audit/{request_id}")
def get_audit_detail(request_id: str):
    records = db_service.get_audit_records()
    for r in records:
        if r.get("request_id", "").lower() == request_id.lower():
            return r
    raise HTTPException(status_code=404, detail=f"Audit record {request_id} not found.")

class DismissAlertRequest(BaseModel):
    alert_id: str
    manager_id: Optional[str] = None

@app.get("/api/manager/alerts")
def get_manager_alerts(
    manager_id: Optional[str] = Query(None),
    department: Optional[str] = Query(None)
):
    return db_service.get_manager_alerts(manager_id=manager_id, department=department)

@app.post("/api/manager/alerts/dismiss")
def dismiss_manager_alert(req: DismissAlertRequest):
    success = db_service.dismiss_manager_alert(alert_id=req.alert_id, manager_id=req.manager_id)
    return {"success": success, "alert_id": req.alert_id}

# Mount frontend static files
if FRONTEND_DIR.exists():
    app.mount("/css", StaticFiles(directory=str(FRONTEND_DIR / "css")), name="css")
    app.mount("/js", StaticFiles(directory=str(FRONTEND_DIR / "js")), name="js")
    if (FRONTEND_DIR / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")

    @app.get("/")
    def serve_index():
        return FileResponse(FRONTEND_DIR / "index.html")

    @app.get("/{full_path:path}")
    def catch_all(full_path: str):
        file_candidate = FRONTEND_DIR / full_path
        if file_candidate.exists() and file_candidate.is_file():
            return FileResponse(file_candidate)
        return FileResponse(FRONTEND_DIR / "index.html")
