import re
from typing import List, Dict, Any, Tuple
from .base_agent import BaseAgent
from ..models.document import CompanyDocument, EvidenceItem
from ..config import CLEARANCE_LEVELS

class EvidenceAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Evidence Analysis Agent",
            description="Performs Step 2 Two-Tier Granular Redaction and extracts factual propositions from authorized sources"
        )

    def redact_sensitive_sections(self, content: str, employee_clearance: str) -> Tuple[str, bool, int]:
        """
        Step 2 of Two-Tier Verification: Content-Level Granular Redaction / Masking.
        Parses section tags like:
          [SECTION:clearance=Restricted]...[/SECTION]
          [RESTRICTED]...[/RESTRICTED]
          [CONFIDENTIAL]...[/CONFIDENTIAL]
        If employee clearance is below required level, replaces section with:
          [REDACTED: Requires {clearance} Clearance]
        """
        user_rank = CLEARANCE_LEVELS.get(employee_clearance, 1)
        redacted_count = 0

        # Pattern 1: [SECTION:clearance=X]...[/SECTION]
        def replace_clearance_section(match):
            nonlocal redacted_count
            req_clearance = match.group(1).capitalize()
            inner_text = match.group(2)
            req_rank = CLEARANCE_LEVELS.get(req_clearance, 3)
            if user_rank < req_rank:
                redacted_count += 1
                return f"[REDACTED: Requires {req_clearance} Clearance]"
            return inner_text

        sanitized = re.sub(
            r'\[SECTION:clearance=([a-zA-Z]+)\](.*?)\[/SECTION\]',
            replace_clearance_section,
            content,
            flags=re.DOTALL | re.IGNORECASE
        )

        # Pattern 2: [RESTRICTED]...[/RESTRICTED]
        def replace_restricted(match):
            nonlocal redacted_count
            inner_text = match.group(1)
            if user_rank < CLEARANCE_LEVELS.get("Restricted", 3):
                redacted_count += 1
                return "[REDACTED: Requires Restricted Clearance]"
            return inner_text

        sanitized = re.sub(
            r'\[RESTRICTED\](.*?)\[/RESTRICTED\]',
            replace_restricted,
            sanitized,
            flags=re.DOTALL | re.IGNORECASE
        )

        # Pattern 3: [CONFIDENTIAL]...[/CONFIDENTIAL]
        def replace_confidential(match):
            nonlocal redacted_count
            inner_text = match.group(1)
            if user_rank < CLEARANCE_LEVELS.get("Confidential", 2):
                redacted_count += 1
                return "[REDACTED: Requires Confidential Clearance]"
            return inner_text

        sanitized = re.sub(
            r'\[CONFIDENTIAL\](.*?)\[/CONFIDENTIAL\]',
            replace_confidential,
            sanitized,
            flags=re.DOTALL | re.IGNORECASE
        )

        return sanitized, (redacted_count > 0), redacted_count

    def analyze_evidence(
        self,
        authorized_docs: List[CompanyDocument],
        timeline: list,
        employee_clearance: str = "Internal"
    ) -> List[EvidenceItem]:
        self.log_event(
            timeline,
            "EVIDENCE",
            "INFO",
            f"Two-Tier Verification (Step 2): Inspecting {len(authorized_docs)} authorized document(s) for granular clearance boundaries (Employee Clearance: '{employee_clearance}')"
        )

        evidence_items: List[EvidenceItem] = []

        for doc in authorized_docs:
            # Step 2: Content-level redaction based on employee clearance
            sanitized_content, is_redacted, redacted_count = self.redact_sensitive_sections(
                doc.content,
                employee_clearance
            )

            # Extract key factual patterns ONLY from unredacted/sanitized text
            facts = []
            
            # Extract revenue/currency numbers (e.g. 120 crore, 125 crore, etc.)
            rev_matches = re.findall(r'(\d+[\d\.,]*\s*(?:crore|million|billion|usd|inr)?)', sanitized_content, re.IGNORECASE)
            for m in rev_matches:
                if m.strip():
                    facts.append(f"Metric value: {m.strip()}")

            # Extract release dates/quarters
            time_matches = re.findall(r'(Q[1-4]|October|November|December|January|February|March|April|May|June|July|August|September)', sanitized_content, re.IGNORECASE)
            for t in time_matches:
                facts.append(f"Period/Timeframe: {t}")

            item = EvidenceItem(
                document_id=doc.document_id,
                title=doc.title,
                version=doc.version,
                effective_date=doc.effective_date,
                classification=doc.classification,
                extracted_facts=facts,
                content_snippet=sanitized_content,
                redacted=is_redacted,
                redacted_sections_count=redacted_count
            )
            evidence_items.append(item)
            
            if is_redacted:
                self.log_event(
                    timeline,
                    "EVIDENCE",
                    "WARNING",
                    f"TWO-TIER GRANULAR REDACTION: Masked {redacted_count} restricted section(s) in {doc.document_id} for clearance '{employee_clearance}'.",
                    details={
                        "document_id": doc.document_id,
                        "version": doc.version,
                        "redacted_sections_count": redacted_count,
                        "employee_clearance": employee_clearance
                    }
                )
            else:
                self.log_event(
                    timeline,
                    "EVIDENCE",
                    "SUCCESS",
                    f"Extracted verified evidence from {doc.document_id} (Version {doc.version}, Effective {doc.effective_date})",
                    details={
                        "document_id": doc.document_id,
                        "version": doc.version,
                        "facts_count": len(facts),
                        "redacted": False
                    }
                )

        return evidence_items
