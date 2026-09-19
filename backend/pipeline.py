from typing import Dict, Any, List, Optional
from datetime import datetime
from .database.db_service import DatabaseService
from .models.employee import EmployeeRecord
from .models.audit import QueryResponse, TimelineEvent
from .agents.identity_agent import IdentityVerificationAgent
from .agents.query_agent import QueryUnderstandingAgent
from .agents.retrieval_agent import DocumentRetrievalAgent
from .agents.authorization_agent import AuthorizationEngine
from .agents.guardrail_agent import SecurityGuardrailAgent
from .agents.evidence_agent import EvidenceAnalysisAgent
from .agents.version_conflict_agent import VersionConflictAgent
from .agents.answer_agent import AnswerAgent
from .agents.citation_agent import CitationAgent
from .agents.audit_agent import AuditAgent

class SentinelPipeline:
    def __init__(self, db: Optional[DatabaseService] = None):
        self.db = db or DatabaseService()
        self.identity_agent = IdentityVerificationAgent(self.db)
        self.query_agent = QueryUnderstandingAgent()
        self.retrieval_agent = DocumentRetrievalAgent(self.db)
        self.auth_engine = AuthorizationEngine()
        self.guardrail_agent = SecurityGuardrailAgent()
        self.evidence_agent = EvidenceAnalysisAgent()
        self.conflict_agent = VersionConflictAgent()
        self.answer_agent = AnswerAgent()
        self.citation_agent = CitationAgent()
        self.audit_agent = AuditAgent(self.db)

    def execute_query(self, user_id: str, question: str) -> QueryResponse:
        timeline: List[TimelineEvent] = []
        agent_statuses: Dict[str, str] = {
            "Identity Agent": "Processing",
            "Security Threat Detection": "Pending",
            "Query Understanding Agent": "Pending",
            "Authorization Gate": "Pending",
            "Document Retrieval Agent": "Pending",
            "Output Security Check": "Pending",
            "Evidence Analysis Agent": "Pending",
            "Version & Conflict Agent": "Pending",
            "Answer Agent": "Pending",
            "Citation Agent": "Pending",
            "Audit Agent": "Pending"
        }

        req_id = self.audit_agent.generate_request_id()
        
        # Initial Event
        now_str = datetime.now().strftime("%H:%M:%S")
        timeline.append(TimelineEvent(
            timestamp=now_str,
            phase="REQUEST",
            agent_name="System Gateway",
            event_type="INFO",
            message=f"Request received: '{question}'",
            details={"request_id": req_id, "user_id": user_id}
        ))

        # 1. Identity Verification
        employee = self.db.get_employee(user_id)
        if not employee or employee.status.lower() != "active":
            status_desc = employee.status if employee else "not_found"
            timeline.append(TimelineEvent(
                timestamp=datetime.now().strftime("%H:%M:%S"),
                phase="IDENTITY",
                agent_name="Identity Verification Agent",
                event_type="DENIED",
                message=f"Identity verification failed: Employee '{user_id}' status is '{status_desc}'."
            ))
            agent_statuses["Identity Agent"] = "Blocked"
            
            # Record failed audit
            audit_record = self.audit_agent.record_request(
                request_id=req_id,
                employee=employee or EmployeeRecord(
                    employee_id=user_id, name="Unknown", email="unknown@xyz.com",
                    department="Unknown", role="Unknown", clearance="Public", status=status_desc,
                    password_hash="", password_salt=""
                ),
                question=question,
                documents_considered=[],
                authorization_decisions=[],
                evidence_used=[],
                answer="Access denied: Employee identity could not be verified or account is inactive.",
                citations=[],
                status="DENIED",
                timeline=timeline
            )
            return QueryResponse(
                request_id=req_id,
                timestamp=audit_record.timestamp,
                question=question,
                answer="Access denied: Employee identity could not be verified or account is inactive.",
                citations=[],
                status="DENIED",
                documents_considered=[],
                authorization_decisions=[],
                blocked_count=0,
                allowed_count=0,
                timeline=timeline,
                agent_statuses=agent_statuses
            )

        agent_statuses["Identity Agent"] = "Completed"
        timeline.append(TimelineEvent(
            timestamp=datetime.now().strftime("%H:%M:%S"),
            phase="IDENTITY",
            agent_name="Identity Verification Agent",
            event_type="SUCCESS",
            message=f"Employee verified: {employee.name} ({employee.employee_id}, {employee.department}, {employee.clearance})",
            details={"employee_id": employee.employee_id, "department": employee.department, "clearance": employee.clearance}
        ))

        # 2. Security Threat Detection (CRITICAL: Runs BEFORE retrieval or normal research pipeline)
        agent_statuses["Security Threat Detection"] = "Processing"
        threat = self.guardrail_agent.detect_security_threat(question=question, employee=employee, timeline=timeline)
        if threat:
            agent_statuses["Security Threat Detection"] = f"Violation ({threat['threat_type']})"
            agent_statuses["Authorization Gate"] = "Blocked (Security Policy Violation)"
            agent_statuses["Document Retrieval Agent"] = "Withheld (0 retrieved)"
            agent_statuses["Answer Agent"] = "Access Denied"
            agent_statuses["Citation Agent"] = "None"
            agent_statuses["Audit Agent"] = "Processing"

            audit_record = self.audit_agent.record_security_violation(
                request_id=req_id,
                employee=employee,
                request=question,
                threat_type=threat["threat_type"],
                answer=threat["response_text"],
                timeline=timeline
            )
            agent_statuses["Audit Agent"] = "Completed"

            return QueryResponse(
                request_id=req_id,
                timestamp=audit_record.timestamp,
                question=question,
                answer=threat["response_text"],
                citations=[],
                status="DENIED",
                event_type="SECURITY_VIOLATION",
                threat_type=threat["threat_type"],
                authorization_status="DENIED",
                action="REQUEST_BLOCKED",
                documents_accessed=[],
                response_status="ACCESS_DENIED",
                documents_considered=[],
                authorization_decisions=[],
                blocked_count=0,
                allowed_count=0,
                timeline=timeline,
                agent_statuses=agent_statuses,
                guardrail_warnings=[threat["reason"]]
            )
        agent_statuses["Security Threat Detection"] = "Completed (Clean)"

        # 3. Query Understanding
        agent_statuses["Query Understanding Agent"] = "Processing"
        query_info = self.query_agent.process_query(question, timeline)
        agent_statuses["Query Understanding Agent"] = "Completed"

        # 4. Authorization Gate (FIRST: Evaluates permissions BEFORE any document is retrieved)
        agent_statuses["Authorization Gate"] = "Processing"
        
        # Discover candidate metadata (IDs, titles, classifications, departments, roles, status) WITHOUT full contents
        candidate_metadata = self.retrieval_agent.discover_candidates(query_info, timeline)
        candidate_ids = [d["document_id"] for d in candidate_metadata]

        # Deterministic pre-retrieval authorization check based on department, role, clearance, and restrictions:
        authorized_doc_ids, auth_decisions = self.auth_engine.evaluate_authorization_before_retrieval(
            employee=employee,
            candidate_metadata=candidate_metadata,
            timeline=timeline
        )

        blocked_count = len(auth_decisions) - len(authorized_doc_ids)
        allowed_count = len(authorized_doc_ids)

        if blocked_count > 0 and allowed_count == 0:
            agent_statuses["Authorization Gate"] = f"Blocked ({blocked_count} blocked, 0 authorized)"
        elif blocked_count > 0:
            agent_statuses["Authorization Gate"] = f"Partial ({blocked_count} blocked, {allowed_count} authorized)"
        else:
            agent_statuses["Authorization Gate"] = f"Completed ({allowed_count} authorized)"

        # 5. Document Retrieval Agent (LATER: Decides whether to retrieve document contents or not based on authorization check)
        agent_statuses["Document Retrieval Agent"] = "Processing"
        authorized_docs = self.retrieval_agent.retrieve_authorized_documents(
            candidate_metadata=candidate_metadata,
            authorized_doc_ids=authorized_doc_ids,
            timeline=timeline
        )
        if len(authorized_docs) > 0 and blocked_count > 0:
            agent_statuses["Document Retrieval Agent"] = f"Completed ({len(authorized_docs)} retrieved, {blocked_count} refused)"
        elif len(authorized_docs) > 0:
            agent_statuses["Document Retrieval Agent"] = f"Completed ({len(authorized_docs)} retrieved)"
        else:
            agent_statuses["Document Retrieval Agent"] = f"Withheld (0 retrieved, {blocked_count} refused)"

        # 6. Output Security Check (Scans retrieved documents for indirect injections)
        agent_statuses["Output Security Check"] = "Processing"
        guarded_docs, guardrail_warnings = self.guardrail_agent.inspect_and_guard(
            question=question,
            authorized_docs=authorized_docs,
            timeline=timeline
        )
        agent_statuses["Output Security Check"] = "Completed"

        # 6. Evidence Analysis (ONLY authorized docs enter here!)
        agent_statuses["Evidence Analysis Agent"] = "Processing"
        evidence_items = self.evidence_agent.analyze_evidence(guarded_docs, timeline)
        agent_statuses["Evidence Analysis Agent"] = "Completed"

        # 7. Version & Conflict Resolution
        agent_statuses["Version & Conflict Agent"] = "Processing"
        reconciled_evidence, conflict_note = self.conflict_agent.reconcile_versions(evidence_items, timeline)
        agent_statuses["Version & Conflict Agent"] = "Completed"

        # 8. Answer Generation (Receives ONLY authorized evidence)
        agent_statuses["Answer Agent"] = "Processing"
        final_answer = self.answer_agent.generate_answer(
            question=question,
            authorized_evidence=reconciled_evidence,
            conflict_note=conflict_note,
            timeline=timeline
        )
        agent_statuses["Answer Agent"] = "Completed"

        # 9. Citation Generation (ONLY authorized evidence)
        agent_statuses["Citation Agent"] = "Processing"
        citations = self.citation_agent.generate_citations(reconciled_evidence, timeline)
        agent_statuses["Citation Agent"] = "Completed"

        # 10. Audit Logging
        agent_statuses["Audit Agent"] = "Processing"
        
        # Status determination aligned with specification:
        if allowed_count > 0:
            request_status = "SUCCESS"
        elif allowed_count == 0 and blocked_count > 0:
            request_status = "ACCESS_LIMITED"
        else:
            request_status = "SUCCESS"

        evidence_ids = [item.document_id for item in reconciled_evidence]

        audit_record = self.audit_agent.record_request(
            request_id=req_id,
            employee=employee,
            question=question,
            documents_considered=candidate_ids,
            authorization_decisions=auth_decisions,
            evidence_used=evidence_ids,
            answer=final_answer,
            citations=citations,
            status=request_status,
            timeline=timeline
        )
        agent_statuses["Audit Agent"] = "Completed"

        return QueryResponse(
            request_id=req_id,
            timestamp=audit_record.timestamp,
            question=question,
            answer=final_answer,
            citations=citations,
            status=request_status,
            event_type=audit_record.event_type,
            threat_type=audit_record.threat_type,
            authorization_status=audit_record.authorization_status,
            action=audit_record.action,
            documents_accessed=audit_record.documents_accessed,
            response_status=audit_record.response_status,
            documents_considered=candidate_ids,
            authorization_decisions=auth_decisions,
            blocked_count=blocked_count,
            allowed_count=allowed_count,
            timeline=timeline,
            agent_statuses=agent_statuses,
            conflict_resolution_note=conflict_note,
            guardrail_warnings=guardrail_warnings
        )
