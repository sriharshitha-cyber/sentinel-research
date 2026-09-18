import re
from typing import List, Dict, Any
from .base_agent import BaseAgent
from ..models.document import CompanyDocument, EvidenceItem

class EvidenceAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Evidence Analysis Agent",
            description="Extracts factual propositions, dates, and metric values from authorized sources"
        )

    def analyze_evidence(
        self,
        authorized_docs: List[CompanyDocument],
        timeline: list
    ) -> List[EvidenceItem]:
        self.log_event(
            timeline,
            "EVIDENCE",
            "INFO",
            f"Analyzing factual evidence across {len(authorized_docs)} authorized document(s)"
        )

        evidence_items: List[EvidenceItem] = []

        for doc in authorized_docs:
            # Extract key factual patterns (amounts, percentages, release dates)
            facts = []
            
            # Extract revenue/currency numbers (e.g. 120 crore, 125 crore, etc.)
            rev_matches = re.findall(r'(\d+[\d\.,]*\s*(?:crore|million|billion|usd|inr)?)', doc.content, re.IGNORECASE)
            for m in rev_matches:
                if m.strip():
                    facts.append(f"Metric value: {m.strip()}")

            # Extract release dates/quarters
            time_matches = re.findall(r'(Q[1-4]|October|November|December|January|February|March|April|May|June|July|August|September)', doc.content, re.IGNORECASE)
            for t in time_matches:
                facts.append(f"Period/Timeframe: {t}")

            item = EvidenceItem(
                document_id=doc.document_id,
                title=doc.title,
                version=doc.version,
                effective_date=doc.effective_date,
                classification=doc.classification,
                extracted_facts=facts,
                content_snippet=doc.content
            )
            evidence_items.append(item)
            
            self.log_event(
                timeline,
                "EVIDENCE",
                "SUCCESS",
                f"Extracted verified evidence from {doc.document_id} (Version {doc.version}, Effective {doc.effective_date})",
                details={
                    "document_id": doc.document_id,
                    "version": doc.version,
                    "facts_count": len(facts)
                }
            )

        return evidence_items
