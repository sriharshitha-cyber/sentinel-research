from typing import List, Optional
from pydantic import BaseModel, Field

class CompanyDocument(BaseModel):
    document_id: str
    title: str
    classification: str  # Public, Internal, Confidential, Restricted
    allowed_departments: List[str]
    allowed_roles: List[str]
    version: str
    effective_date: str
    status: str = "active"
    content: str
    summary: Optional[str] = None

class AuthorizationDecision(BaseModel):
    document_id: str
    title: Optional[str] = None
    classification: Optional[str] = None
    decision: str  # ALLOW or DENY
    reason: str
    evaluated_clearance: str
    evaluated_department: str
    evaluated_role: str

class EvidenceItem(BaseModel):
    document_id: str
    title: str
    version: str
    effective_date: str
    classification: str
    extracted_facts: List[str] = []
    content_snippet: str

class CitationItem(BaseModel):
    document_id: str
    title: str
    version: str
    effective_date: str
    classification: str
