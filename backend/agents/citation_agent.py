from datetime import datetime
from typing import List
from .base_agent import BaseAgent
from ..models.document import EvidenceItem, CitationItem

class CitationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Citation Agent",
            description="Generates tamper-proof citations referencing only verified authorized evidence"
        )

    def _format_date(self, d_str: str) -> str:
        try:
            dt = datetime.strptime(d_str.strip(), "%Y-%m-%d")
            # Format as "September 1, 2026"
            day = dt.day
            month = dt.strftime("%B")
            year = dt.year
            return f"{month} {day}, {year}"
        except Exception:
            return d_str

    def generate_citations(
        self,
        authorized_evidence: List[EvidenceItem],
        timeline: list
    ) -> List[CitationItem]:
        citations = []
        for item in authorized_evidence:
            formatted_date = self._format_date(item.effective_date)
            cit = CitationItem(
                document_id=item.document_id,
                title=item.title,
                version=item.version,
                effective_date=formatted_date,
                classification=item.classification
            )
            citations.append(cit)
            self.log_event(
                timeline,
                "CITATION",
                "SUCCESS",
                f"Generated citation: {cit.document_id} ({cit.title}, Version {cit.version}, {cit.effective_date})",
                details=cit.model_dump()
            )
            
        if not citations:
            self.log_event(timeline, "CITATION", "INFO", "No authorized citations generated (zero authorized evidence used).")

        return citations
