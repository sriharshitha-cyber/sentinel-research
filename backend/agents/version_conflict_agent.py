from typing import List, Tuple, Optional
from packaging import version
from datetime import datetime
from .base_agent import BaseAgent
from ..models.document import EvidenceItem

class VersionConflictAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Version & Conflict Agent",
            description="Performs version ordering, effective date resolution, and conflict reconciliation"
        )

    def _parse_version(self, v_str: str) -> float:
        try:
            return float(v_str.replace("v", "").strip())
        except Exception:
            return 1.0

    def _parse_date(self, d_str: str) -> datetime:
        try:
            return datetime.strptime(d_str.strip(), "%Y-%m-%d")
        except Exception:
            return datetime.min

    def reconcile_versions(
        self,
        evidence_items: List[EvidenceItem],
        timeline: list
    ) -> Tuple[List[EvidenceItem], Optional[str]]:
        if not evidence_items:
            self.log_event(timeline, "VERSION_CONFLICT", "INFO", "No authorized evidence to compare for version conflict.")
            return [], None

        if len(evidence_items) == 1:
            item = evidence_items[0]
            self.log_event(
                timeline,
                "VERSION_CONFLICT",
                "SUCCESS",
                f"Single authorized version verified: {item.document_id} (Version {item.version})"
            )
            return evidence_items, None

        self.log_event(
            timeline,
            "VERSION_CONFLICT",
            "INFO",
            f"Comparing {len(evidence_items)} authorized sources for version supersession and potential conflicts"
        )

        # Sort evidence items by Effective Date descending, then Version descending
        sorted_items = sorted(
            evidence_items,
            key=lambda x: (self._parse_date(x.effective_date), self._parse_version(x.version)),
            reverse=True
        )

        primary = sorted_items[0]
        older_items = sorted_items[1:]

        older_summary = ", ".join([f"{item.document_id} (v{item.version}, Eff. {item.effective_date})" for item in older_items])
        resolution_note = (
            f"Version resolution: {primary.document_id} (Version {primary.version}, Effective {primary.effective_date}) "
            f"identified as the latest authoritative source, superseding older version(s): {older_summary}."
        )

        self.log_event(
            timeline,
            "VERSION_CONFLICT",
            "SUCCESS",
            f"Resolved latest valid authorized version: {primary.document_id} (v{primary.version}) supersedes older versions",
            details={
                "selected_document": primary.document_id,
                "selected_version": primary.version,
                "superseded": [i.document_id for i in older_items],
                "note": resolution_note
            }
        )

        return [primary], resolution_note
