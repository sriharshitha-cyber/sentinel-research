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
        timeline: List[TimelineEvent]
    ) -> AuditRecord:
        now_iso = datetime.now().astimezone().isoformat()

        # Sanitize authorization decisions: NEVER include document content in audit records
        sanitized_decisions = []
        for d in authorization_decisions:
            sanitized_decisions.append(d)

        record = AuditRecord(
            request_id=request_id,
            timestamp=now_iso,
            user_id=employee.employee_id,
            user_name=employee.name,
            department=employee.department,
            role=employee.role,
            clearance=employee.clearance,
            question=question,
            documents_considered=documents_considered,
            authorization_decisions=sanitized_decisions,
            evidence_used=evidence_used,
            answer=answer,
            citations=citations,
            status=status,
            timeline=timeline
        )

        self.db.append_audit_record(record)
        
        self.log_event(
            timeline,
            "AUDIT",
            "SUCCESS",
            f"Audit ledger updated: Request {request_id} recorded with status '{status}'",
            details={
                "request_id": request_id,
                "status": status,
                "documents_considered_count": len(documents_considered),
                "evidence_count": len(evidence_used)
            }
        )
        return record
