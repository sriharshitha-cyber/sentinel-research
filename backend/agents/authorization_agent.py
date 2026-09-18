from typing import List, Tuple, Dict, Any, Union
from .base_agent import BaseAgent
from ..models.employee import EmployeeRecord
from ..models.document import CompanyDocument, AuthorizationDecision
from ..config import CLEARANCE_LEVELS

class AuthorizationEngine(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Authorization Engine",
            description="Deterministic pre-LLM security gate enforcing clearance, department, role, and restriction policies BEFORE document retrieval"
        )

    def evaluate_authorization_before_retrieval(
        self,
        employee: EmployeeRecord,
        candidate_metadata: List[Dict[str, Any]],
        timeline: list
    ) -> Tuple[List[str], List[AuthorizationDecision]]:
        """
        Deterministic Authorization Gate executed BEFORE document retrieval.
        Inspects candidate document metadata against employee clearance, department, role, and restrictions.
        Decides which documents the Retrieval Agent is permitted to retrieve.
        Returns:
            Tuple[List[str], List[AuthorizationDecision]]:
            - authorized_doc_ids: List of document IDs approved to be fetched from storage.
            - all_decisions: Full audit ledger of decisions (ALLOW/DENY) with explicit reasons.
        """
        self.log_event(
            timeline,
            "AUTHORIZATION",
            "INFO",
            f"Pre-retrieval authorization check: Evaluating {len(candidate_metadata)} candidate metadata records against employee {employee.employee_id} ({employee.department}, Role: {employee.role}, Clearance: {employee.clearance})"
        )

        authorized_doc_ids: List[str] = []
        all_decisions: List[AuthorizationDecision] = []

        # Check employee active status first
        if employee.status.lower() != "active":
            for doc in candidate_metadata:
                doc_id = doc.get("document_id")
                title = doc.get("title")
                classification = doc.get("classification")
                dec = AuthorizationDecision(
                    document_id=doc_id,
                    title=title,
                    classification=classification,
                    decision="DENY",
                    reason=f"Employee account is not active (Status: {employee.status})",
                    evaluated_clearance=employee.clearance,
                    evaluated_department=employee.department,
                    evaluated_role=employee.role
                )
                all_decisions.append(dec)
                self.log_event(
                    timeline,
                    "AUTHORIZATION",
                    "DENIED",
                    f"BLOCKED BEFORE RETRIEVAL: {doc_id} DENIED - Employee status is '{employee.status}'. Retrieval withheld.",
                    details=dec.model_dump()
                )
            return [], all_decisions

        emp_clearance_rank = CLEARANCE_LEVELS.get(employee.clearance, -1)

        for doc in candidate_metadata:
            doc_id = doc.get("document_id")
            title = doc.get("title", "")
            classification = doc.get("classification", "Restricted")
            allowed_departments = doc.get("allowed_departments", [])
            allowed_roles = doc.get("allowed_roles", [])
            doc_status = doc.get("status", "active")
            doc_clearance_rank = CLEARANCE_LEVELS.get(classification, 999)

            # 1. Clearance Check (Hierarchy: Public < Internal < Confidential < Restricted)
            if emp_clearance_rank < doc_clearance_rank:
                dec = AuthorizationDecision(
                    document_id=doc_id,
                    title=title,
                    classification=classification,
                    decision="DENY",
                    reason=f"Insufficient clearance (Required: {classification}, Employee: {employee.clearance})",
                    evaluated_clearance=employee.clearance,
                    evaluated_department=employee.department,
                    evaluated_role=employee.role
                )
                all_decisions.append(dec)
                self.log_event(
                    timeline,
                    "AUTHORIZATION",
                    "DENIED",
                    f"BLOCKED BEFORE RETRIEVAL: {doc_id} DENIED - Insufficient clearance ({employee.clearance} < {classification}). Content will NOT be retrieved.",
                    details=dec.model_dump()
                )
                continue

            # 2. Department Check
            dept_allowed = ("*" in allowed_departments) or (employee.department in allowed_departments)
            if not dept_allowed:
                dec = AuthorizationDecision(
                    document_id=doc_id,
                    title=title,
                    classification=classification,
                    decision="DENY",
                    reason=f"Department mismatch (Allowed: {', '.join(allowed_departments)}, Employee: {employee.department})",
                    evaluated_clearance=employee.clearance,
                    evaluated_department=employee.department,
                    evaluated_role=employee.role
                )
                all_decisions.append(dec)
                self.log_event(
                    timeline,
                    "AUTHORIZATION",
                    "DENIED",
                    f"BLOCKED BEFORE RETRIEVAL: {doc_id} DENIED - Department mismatch (Allowed: {', '.join(allowed_departments)}, Employee: {employee.department}). Content will NOT be retrieved.",
                    details=dec.model_dump()
                )
                continue

            # 3. Role Check
            role_allowed = ("*" in allowed_roles) or (employee.role in allowed_roles)
            if not role_allowed:
                dec = AuthorizationDecision(
                    document_id=doc_id,
                    title=title,
                    classification=classification,
                    decision="DENY",
                    reason=f"Role mismatch (Allowed: {', '.join(allowed_roles)}, Employee: {employee.role})",
                    evaluated_clearance=employee.clearance,
                    evaluated_department=employee.department,
                    evaluated_role=employee.role
                )
                all_decisions.append(dec)
                self.log_event(
                    timeline,
                    "AUTHORIZATION",
                    "DENIED",
                    f"BLOCKED BEFORE RETRIEVAL: {doc_id} DENIED - Role mismatch (Allowed: {', '.join(allowed_roles)}, Employee: {employee.role}). Content will NOT be retrieved.",
                    details=dec.model_dump()
                )
                continue

            # 4. Document Status Check
            if doc_status.lower() != "active":
                dec = AuthorizationDecision(
                    document_id=doc_id,
                    title=title,
                    classification=classification,
                    decision="DENY",
                    reason=f"Document status is inactive (Status: {doc_status})",
                    evaluated_clearance=employee.clearance,
                    evaluated_department=employee.department,
                    evaluated_role=employee.role
                )
                all_decisions.append(dec)
                self.log_event(
                    timeline,
                    "AUTHORIZATION",
                    "DENIED",
                    f"BLOCKED BEFORE RETRIEVAL: {doc_id} DENIED - Document inactive ({doc_status}). Content will NOT be retrieved.",
                    details=dec.model_dump()
                )
                continue

            # Passed all deterministic checks -> ALLOW FOR RETRIEVAL
            dec = AuthorizationDecision(
                document_id=doc_id,
                title=title,
                classification=classification,
                decision="ALLOW",
                reason="Employee department, role, clearance, and document status are authorized",
                evaluated_clearance=employee.clearance,
                evaluated_department=employee.department,
                evaluated_role=employee.role
            )
            all_decisions.append(dec)
            authorized_doc_ids.append(doc_id)
            self.log_event(
                timeline,
                "AUTHORIZATION",
                "SUCCESS",
                f"PERMIT GRANTED FOR RETRIEVAL: {doc_id} ALLOWED - Authorized for employee {employee.employee_id} ({employee.department})",
                details=dec.model_dump()
            )

        blocked_count = len(all_decisions) - len(authorized_doc_ids)
        self.log_event(
            timeline,
            "AUTHORIZATION",
            "INFO",
            f"Pre-Retrieval Authorization Summary: {len(authorized_doc_ids)} ALLOWED for retrieval, {blocked_count} BLOCKED BEFORE RETRIEVAL"
        )
        return authorized_doc_ids, all_decisions

    def evaluate_authorization(
        self,
        employee: EmployeeRecord,
        candidates: List[Any],
        timeline: list
    ) -> Tuple[List[Any], List[AuthorizationDecision]]:
        """Backward-compatible helper evaluating candidate documents or metadata."""
        meta_list = []
        for c in candidates:
            if isinstance(c, dict):
                meta_list.append(c)
            elif hasattr(c, "model_dump"):
                meta_list.append(c.model_dump())
            else:
                meta_list.append({
                    "document_id": getattr(c, "document_id", ""),
                    "title": getattr(c, "title", ""),
                    "classification": getattr(c, "classification", "Restricted"),
                    "allowed_departments": getattr(c, "allowed_departments", []),
                    "allowed_roles": getattr(c, "allowed_roles", []),
                    "status": getattr(c, "status", "active")
                })
        
        allowed_ids, decisions = self.evaluate_authorization_before_retrieval(employee, meta_list, timeline)
        allowed_objs = [c for c in candidates if (getattr(c, "document_id", None) or (c.get("document_id") if isinstance(c, dict) else None)) in allowed_ids]
        return allowed_objs, decisions
