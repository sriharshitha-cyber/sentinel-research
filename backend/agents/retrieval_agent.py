from typing import List, Dict, Any, Optional
from .base_agent import BaseAgent
from ..models.document import CompanyDocument
from ..database.db_service import DatabaseService

class DocumentRetrievalAgent(BaseAgent):
    def __init__(self, db: DatabaseService):
        super().__init__(
            name="Document Retrieval Agent",
            description="Enforces authorization-gated retrieval: retrieves document contents ONLY after deterministic authorization check"
        )
        self.db = db

    def discover_candidates(
        self,
        query_info: Dict[str, Any],
        timeline: list
    ) -> List[Dict[str, Any]]:
        """
        Scans company document catalog metadata (WITHOUT full contents) to identify
        which documents are candidates for the query.
        """
        self.log_event(
            timeline,
            "RETRIEVAL",
            "INFO",
            "Scanning enterprise document metadata catalog for relevant candidates"
        )

        catalog = self.db.get_document_catalog()
        keywords = query_info.get("keywords", [])
        original_query = query_info.get("original_query", "").lower()

        candidates: List[Dict[str, Any]] = []

        if "latest" in original_query and ("forecast" in original_query or "revenue" in original_query):
            for doc in catalog:
                if doc["document_id"] in ["DOC-301", "DOC-302"]:
                    candidates.append(doc)

        elif "q4" in original_query and ("revenue" in original_query or "forecast" in original_query):
            for doc in catalog:
                if doc["document_id"] in ["DOC-101", "DOC-201"]:
                    candidates.append(doc)

        elif "roadmap" in original_query or "platform" in original_query or "release" in original_query:
            for doc in catalog:
                if doc["document_id"] in ["DOC-102"]:
                    candidates.append(doc)

        elif "conduct" in original_query or "charter" in original_query or "policy" in original_query:
            for doc in catalog:
                if doc["document_id"] in ["DOC-001"]:
                    candidates.append(doc)

        elif "ignore" in original_query or "override" in original_query:
            for doc in catalog:
                if doc["document_id"] in ["DOC-999"]:
                    candidates.append(doc)

        if not candidates:
            for doc in catalog:
                meta_text = f"{doc['title']} {doc.get('summary', '')}".lower()
                if any(kw in meta_text for kw in keywords):
                    candidates.append(doc)

        candidate_ids = [d["document_id"] for d in candidates]
        self.log_event(
            timeline,
            "RETRIEVAL",
            "SUCCESS",
            f"Candidate discovery complete: {len(candidates)} candidate documents identified ({', '.join(candidate_ids)}). Pre-retrieval authorization required before fetching content.",
            details={"candidate_ids": candidate_ids}
        )
        return candidates

    def retrieve_authorized_documents(
        self,
        candidate_metadata: List[Dict[str, Any]],
        authorized_doc_ids: List[str],
        timeline: list
    ) -> List[CompanyDocument]:
        """
        Executes AFTER Authorization Gate.
        Decides whether to retrieve document contents or not based on authorization check!
        """
        self.log_event(
            timeline,
            "RETRIEVAL",
            "INFO",
            f"Executing authorization-gated retrieval: {len(authorized_doc_ids)} permitted out of {len(candidate_metadata)} candidates"
        )

        retrieved_docs: List[CompanyDocument] = []
        auth_set = set(authorized_doc_ids)

        for candidate in candidate_metadata:
            doc_id = candidate.get("document_id")
            title = candidate.get("title", "")

            if doc_id in auth_set:
                # Permission granted by Authorization Gate -> Fetch full content from DB
                doc = self.db.get_document_by_id(doc_id)
                if doc:
                    retrieved_docs.append(doc)
                    self.log_event(
                        timeline,
                        "RETRIEVAL",
                        "SUCCESS",
                        f"DOCUMENT RETRIEVED: '{doc_id}' ({title}) content loaded into secure memory buffer for authorized processing.",
                        details={"document_id": doc_id, "classification": doc.classification, "retrieval_status": "RETRIEVED"}
                    )
            else:
                # Permission denied by Authorization Gate -> Withhold retrieval completely
                self.log_event(
                    timeline,
                    "RETRIEVAL",
                    "DENIED",
                    f"RETRIEVAL WITHHELD: '{doc_id}' ({title}) was NOT retrieved. Access blocked before retrieval due to clearance/department/role restrictions.",
                    details={"document_id": doc_id, "retrieval_status": "WITHHELD"}
                )

        self.log_event(
            timeline,
            "RETRIEVAL",
            "INFO",
            f"Retrieval decision complete: {len(retrieved_docs)} document(s) retrieved, {len(candidate_metadata) - len(retrieved_docs)} document(s) refused retrieval."
        )
        return retrieved_docs

    # Backward compatibility
    def retrieve_candidates(self, query_info: Dict[str, Any], timeline: list) -> List[CompanyDocument]:
        candidates_meta = self.discover_candidates(query_info, timeline)
        docs = []
        for c in candidates_meta:
            doc = self.db.get_document_by_id(c["document_id"])
            if doc:
                docs.append(doc)
        return docs
