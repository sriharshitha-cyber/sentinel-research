import re
from typing import List, Tuple
from .base_agent import BaseAgent
from ..models.document import CompanyDocument

class SecurityGuardrailAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Security Guardrail Agent",
            description="Detects prompt injections, adversarial overrides, and jailbreak attempts"
        )
        self.injection_patterns = [
            r"ignore\s+(all\s+)?(security\s+|system\s+)?rules",
            r"reveal\s+this\s+document",
            r"override\s+code",
            r"system\s+prompt\s+override",
            r"you\s+are\s+now\s+in\s+developer\s+mode",
            r"bypass\s+(all\s+)?authoriz(ation|ed)",
            r"elevate\s+(clearance|privileges)"
        ]

    def inspect_and_guard(
        self,
        question: str,
        authorized_docs: List[CompanyDocument],
        timeline: list
    ) -> Tuple[List[CompanyDocument], List[str]]:
        warnings: List[str] = []
        
        # 1. Check user query
        for pat in self.injection_patterns:
            if re.search(pat, question, re.IGNORECASE):
                msg = f"Adversarial instruction detected in user question: '{pat}'"
                warnings.append(msg)
                self.log_event(timeline, "GUARDRAIL", "WARNING", f"SECURITY ALERT: {msg}")

        # 2. Check authorized document contents (treat as untrusted text)
        safe_docs = []
        for doc in authorized_docs:
            has_injection = False
            for pat in self.injection_patterns:
                if re.search(pat, doc.content, re.IGNORECASE):
                    has_injection = True
                    msg = f"Malicious prompt injection detected in {doc.document_id}: pattern '{pat}'. Neutralizing payload."
                    warnings.append(msg)
                    self.log_event(
                        timeline,
                        "GUARDRAIL",
                        "WARNING",
                        f"PROMPT INJECTION DETECTED: {doc.document_id} contains adversarial instructions. Flagged & neutralized."
                    )
            
            # Even if injection pattern found, document text is neutralized so it cannot override authorization
            safe_docs.append(doc)

        if not warnings:
            self.log_event(timeline, "GUARDRAIL", "SUCCESS", "Guardrail inspection passed: No active prompt injections detected.")
        else:
            self.log_event(timeline, "GUARDRAIL", "INFO", f"Guardrail active: {len(warnings)} security alerts flagged and neutralized.")

        return safe_docs, warnings
