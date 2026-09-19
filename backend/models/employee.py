from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class EmployeeRecord(BaseModel):
    employee_id: str
    name: str
    email: str
    department: str
    role: str
    clearance: str  # Public, Internal, Confidential, Restricted
    status: str = "active"  # active, suspended, inactive
    password_hash: str
    password_salt: str
    must_change_password: bool = True
    is_admin: bool = False
    is_manager: bool = False

class EmployeePublicProfile(BaseModel):
    employee_id: str
    name: str
    email: str
    department: str
    role: str
    clearance: str
    status: str
    must_change_password: bool
    is_admin: bool
    is_manager: bool = False
    identity_source: str = "Company Employee Directory"

class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Employee ID (e.g. U102) or Company Email")
    password: str

class PasswordChangeRequest(BaseModel):
    employee_id: str
    new_password: str
    confirm_password: str

class ProfileVerificationRequest(BaseModel):
    employee_id: str
    claimed_department: str
    claimed_role: str
