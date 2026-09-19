from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from .document import AuthorizationDecision, CitationItem

class TimelineEvent(BaseModel):
    timestamp: str
    phase: str
    agent_name: str
    event_type: str  # INFO, SUCCESS, WARNING, DENIED, ERROR
    message: str
    details: Optional[Dict[str, Any]] = None

class AuditRecord(BaseModel):
    request_id: str
    timestamp: str
    user_id: str
    employee_name: Optional[str] = None
    user_name: Optional[str] = None
    department: str
    role: str
    clearance: str
    request: Optional[str] = None
    question: str
    event_type: str = "STANDARD_QUERY"  # SECURITY_VIOLATION or STANDARD_QUERY
    threat_type: Optional[str] = None
    authorization_status: Optional[str] = None  # DENIED, AUTHORIZED, ACCESS_LIMITED
    action: Optional[str] = None  # REQUEST_BLOCKED, RETRIEVAL_ALLOWED, WITHHELD
    documents_accessed: List[str] = []
    response_status: Optional[str] = None  # ACCESS_DENIED, SUCCESS, ACCESS_LIMITED
    documents_considered: List[str] = []
    authorization_decisions: List[AuthorizationDecision] = []
    evidence_used: List[str] = []  # Document IDs only
    answer: str
    citations: List[CitationItem] = []
    status: str  # SUCCESS, ACCESS_LIMITED, DENIED, ERROR
    timeline: List[TimelineEvent] = []
    visual_data: Optional[Dict[str, Any]] = None
    content_redacted: bool = False
    redacted_sections_count: int = 0
    two_tier_status: Optional[str] = None

class QueryRequest(BaseModel):
    user_id: str
    question: str

class QueryResponse(BaseModel):
    request_id: str
    timestamp: str
    question: str
    answer: str
    citations: List[CitationItem] = []
    status: str
    event_type: Optional[str] = None
    threat_type: Optional[str] = None
    authorization_status: Optional[str] = None
    action: Optional[str] = None
    documents_accessed: List[str] = []
    response_status: Optional[str] = None
    documents_considered: List[str] = []
    authorization_decisions: List[AuthorizationDecision] = []
    blocked_count: int = 0
    allowed_count: int = 0
    timeline: List[TimelineEvent] = []
    agent_statuses: Dict[str, str] = {}
    conflict_resolution_note: Optional[str] = None
    guardrail_warnings: List[str] = []
    visual_data: Optional[Dict[str, Any]] = None
    content_redacted: bool = False
    redacted_sections_count: int = 0
    two_tier_status: Optional[str] = None
