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
    user_name: Optional[str] = None
    department: str
    role: str
    clearance: str
    question: str
    documents_considered: List[str]
    authorization_decisions: List[AuthorizationDecision]
    evidence_used: List[str]  # Document IDs only
    answer: str
    citations: List[CitationItem]
    status: str  # SUCCESS, ACCESS_LIMITED, DENIED, ERROR
    timeline: List[TimelineEvent] = []

class QueryRequest(BaseModel):
    user_id: str
    question: str

class QueryResponse(BaseModel):
    request_id: str
    timestamp: str
    question: str
    answer: str
    citations: List[CitationItem]
    status: str
    documents_considered: List[str]
    authorization_decisions: List[AuthorizationDecision]
    blocked_count: int
    allowed_count: int
    timeline: List[TimelineEvent]
    agent_statuses: Dict[str, str]
    conflict_resolution_note: Optional[str] = None
    guardrail_warnings: List[str] = []
