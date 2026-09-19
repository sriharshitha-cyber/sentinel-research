import random
from datetime import datetime
from typing import List, Dict, Any, Optional
from .base_agent import BaseAgent
from ..models.employee import EmployeeRecord
from ..models.document import AuthorizationDecision, CitationItem
from ..models.audit import AuditRecord, TimelineEvent
from ..database.db_service import DatabaseService

class AuditAgent(BaseAgent):
    def __init__(self, db: DatabaseService):
        super().__init__(
            name="Audit Agent",
            description="Maintains immutable compliance ledger and real-time security telemetry"
        )
        self.db = db

    def generate_request_id(self) -> str:
        date_part = datetime.now().strftime("%Y%m%d")
        rand_num = random.randint(10000, 99999)
        return f"REQ-{date_part}-{rand_num}"

    def record_security_violation(
        self,
        request_id: str,
        employee: EmployeeRecord,
        request: str,
        threat_type: str,
        answer: str,
        timeline: List[TimelineEvent]
    ) -> AuditRecord:
        now_iso = datetime.now().astimezone().isoformat()
        record = AuditRecord(
            request_id=request_id,
            timestamp=now_iso,
            user_id=employee.employee_id,
            employee_name=employee.name,
            user_name=employee.name,
            department=employee.department,
            role=employee.role,
            clearance=employee.clearance,
            request=request,
            question=request,
            event_type="SECURITY_VIOLATION",
            threat_type=threat_type,
            authorization_status="DENIED",
            action="REQUEST_BLOCKED",
            documents_accessed=[],
            response_status="ACCESS_DENIED",
            documents_considered=[],
            authorization_decisions=[],
            evidence_used=[],
            answer=answer,
            citations=[],
            status="DENIED",
            timeline=timeline
        )
        self.db.append_audit_record(record)
        self.log_event(
            timeline,
            "AUDIT",
            "DENIED",
            f"SECURITY VIOLATION LOGGED: Request {request_id} blocked for '{threat_type}'. Audit ledger persisted.",
            details={
                "request_id": request_id,
                "threat_type": threat_type,
                "action": "REQUEST_BLOCKED",
                "authorization_status": "DENIED",
                "documents_accessed": []
            }
        )
        return record

    def record_request(
        self,
        request_id: str,
        employee: EmployeeRecord,
        question: str,
        documents_considered: List[str],
        authorization_decisions: List[AuthorizationDecision],
        evidence_used: List[str],
        answer: str,
        citations: List[CitationItem],
        status: str,
        timeline: List[TimelineEvent],
        event_type: str = "STANDARD_QUERY",
        threat_type: Optional[str] = None,
        action: Optional[str] = None,
        visual_data: Optional[Dict[str, Any]] = None,
        content_redacted: bool = False,
        redacted_sections_count: int = 0,
        two_tier_status: Optional[str] = None
    ) -> AuditRecord:
        now_iso = datetime.now().astimezone().isoformat()

        # Sanitize authorization decisions: NEVER include document content in audit records
        sanitized_decisions = []
        for d in authorization_decisions:
            sanitized_decisions.append(d)

        auth_status = "DENIED" if status == "DENIED" else ("ACCESS_LIMITED" if status == "ACCESS_LIMITED" else "AUTHORIZED")
        default_action = "REQUEST_BLOCKED" if status == "DENIED" else ("RETRIEVAL_ALLOWED" if status == "SUCCESS" else "WITHHELD")
        resp_status = "ACCESS_DENIED" if status == "DENIED" else ("ACCESS_LIMITED" if status == "ACCESS_LIMITED" else "SUCCESS")

        record = AuditRecord(
            request_id=request_id,
            timestamp=now_iso,
            user_id=employee.employee_id,
            employee_name=employee.name,
            user_name=employee.name,
            department=employee.department,
            role=employee.role,
            clearance=employee.clearance,
            request=question,
            question=question,
            event_type=event_type,
            threat_type=threat_type,
            authorization_status=auth_status,
            action=action or default_action,
            documents_accessed=evidence_used,
            response_status=resp_status,
            documents_considered=documents_considered,
            authorization_decisions=sanitized_decisions,
            evidence_used=evidence_used,
            answer=answer,
            citations=citations,
            status=status,
            timeline=timeline,
            visual_data=visual_data,
            content_redacted=content_redacted,
            redacted_sections_count=redacted_sections_count,
            two_tier_status=two_tier_status
        )

        self.db.append_audit_record(record)
        
        self.log_event(
            timeline,
            "AUDIT",
            "SUCCESS" if status == "SUCCESS" else "INFO",
            f"Audit ledger updated: Request {request_id} recorded with status '{status}'",
            details={
                "request_id": request_id,
                "status": status,
                "documents_considered_count": len(documents_considered),
                "evidence_count": len(evidence_used)
            }
        )
        return record
