import re
from typing import List, Tuple, Optional, Dict, Any
from .base_agent import BaseAgent
from ..models.document import CompanyDocument
from ..models.employee import EmployeeRecord

class SecurityGuardrailAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Security Threat Detection Agent",
            description="Detects and blocks security violations, prompt injections, credential harvesting, privilege escalation, and system attack attempts BEFORE retrieval"
        )

        # Categorized Threat Signatures
        self.threat_rules = [
            {
                "threat_type": "PASSWORD_REQUEST",
                "patterns": [
                    r"every\s+employee('?s)?\s+password",
                    r"(give|show|reveal|tell|get|find|list|dump|provide|what\s+is|what's)\s+(me\s+)?(all\s+)?(the\s+)?(any\s+)?.*password",
                    r"(admin|administrator|root|user|employee)\s+password",
                    r"password\s+(hash|salt|list|table|database|store)",
                    r"(cleartext|plaintext)\s+password",
                    r"passwords?\s+of\s+"
                ],
                "response": "ACCESS DENIED\n\nCredentials and authentication secrets cannot be provided.",
                "reason": "Requests to reveal passwords or credentials are strictly prohibited."
            },
            {
                "threat_type": "CREDENTIAL_REQUEST",
                "patterns": [
                    r"(give|show|reveal|tell|dump|leak|provide|what\s+is|what's)\s+(me\s+)?.*credential",
                    r"(login|auth|session)\s+(token|cookie|credential|hash|salt|secret)",
                    r"employee\s+credentials",
                    r"authentication\s+secrets?"
                ],
                "response": "ACCESS DENIED\n\nCredentials and authentication secrets cannot be provided.",
                "reason": "Requests to reveal credentials, tokens, or authentication secrets are prohibited."
            },
            {
                "threat_type": "PRIVILEGE_ESCALATION",
                "patterns": [
                    r"hack\s+the\s+system\s+and\s+(give|grant)\s+me\s+admin",
                    r"(grant|give|make)\s+me\s+(an?\s+)?(admin|administrator|root|superuser|executive)",
                    r"(escalate|elevate|raise|boost)\s+(my\s+)?(clearance|privilege|permission|access|role)",
                    r"(sudo\s+|sudo$|run\s+as\s+root|su\s+-)",
                    r"elevate\s+(clearance|privileges)",
                    r"administrator\s+privileges"
                ],
                "response": "ACCESS DENIED\n\nRequests to bypass authentication, authorization, or security controls are not permitted.",
                "reason": "Requests to escalate privileges or grant administrator access are strictly prohibited."
            },
            {
                "threat_type": "AUTHORIZATION_BYPASS",
                "patterns": [
                    r"bypass\s+(all\s+)?(auth|authoriz|security|access|permission|clearance|control|policy)",
                    r"disable\s+(all\s+)?(security|auth|authoriz|guardrail|rule|control|gate|filter)",
                    r"turn\s+off\s+(security|auth|authoriz|protection|gate|filter)",
                    r"skip\s+(the\s+)?(authorization|clearance|security|permission)\s+(gate|check|rule)",
                    r"without\s+(any\s+)?(authorization|permission|clearance|restriction)",
                    r"ignore\s+(all\s+)?(authorization|clearance|permission)\s+(rules|checks|restrictions)"
                ],
                "response": "ACCESS DENIED\n\nRequests to bypass authentication, authorization, or security controls are not permitted.",
                "reason": "Requests to bypass authorization or disable security controls are prohibited."
            },
            {
                "threat_type": "SYSTEM_ATTACK_REQUEST",
                "patterns": [
                    r"hack\s+(the\s+)?(system|server|database|network|sentinel|platform)",
                    r"compromise\s+(the\s+)?(system|security|server|infrastructure)",
                    r"(sql\s+injection|remote\s+code\s+execution|exploit\s+vulnerability|penetrate\s+firewall|ddos|denial\s+of\s+service)",
                    r"(drop\s+table|delete\s+database|truncate\s+table)"
                ],
                "response": "ACCESS DENIED\n\nRequests to compromise or attack the system are strictly prohibited.",
                "reason": "Requests to hack, compromise, or attack the platform are prohibited."
            },
            {
                "threat_type": "PROMPT_INJECTION",
                "patterns": [
                    r"ignore\s+(all\s+)?(security\s+|system\s+|previous\s+|prior\s+)?(rules|instructions|prompts|guidelines)",
                    r"system\s+prompt\s+(override|reveal|leak|show)",
                    r"reveal\s+(this\s+document|system\s+prompt|hidden\s+(security\s+)?instructions)",
                    r"override\s+code",
                    r"you\s+are\s+now\s+in\s+(developer|jailbreak|unrestricted|god)\s+mode",
                    r"(DAN|jailbreak)\s+mode",
                    r"disregard\s+(all\s+)?(rules|instructions|safeguards)",
                    r"manipulate\s+(the\s+)?agents?"
                ],
                "response": "ACCESS DENIED\n\nThis request violates your authorization or security policy.",
                "reason": "Prompt injection or system prompt override attempt detected."
            },
            {
                "threat_type": "SECRET_EXFILTRATION",
                "patterns": [
                    r"(reveal|show|give|leak|dump|display|get)\s+(me\s+)?(the\s+)?(api\s+keys?|secret\s+keys?|tokens?|env\s+vars?|environment\s+variables?|pepper|salt|private\s+key|encryption\s+key)",
                    r"(what\s+is|what's)\s+(the\s+)?(api\s+key|jwt\s+secret|pepper|internal\s+secret)"
                ],
                "response": "ACCESS DENIED\n\nSystem secrets, API keys, and internal tokens cannot be revealed.",
                "reason": "Requests to reveal API keys, cryptographic tokens, or secrets are prohibited."
            },
            {
                "threat_type": "IMPERSONATION_ATTEMPT",
                "patterns": [
                    r"(impersonate|pretend\s+(to\s+be|you\s+are|I\s+am)|act\s+as)\s+(an?\s+)?(admin|administrator|executive|ceo|director|sarah\s+chen|another\s+employee)",
                    r"(run|execute)\s+(this\s+)?(query|request)\s+as\s+(admin|executive|another\s+user)",
                    r"spoof\s+(identity|employee|user|role)"
                ],
                "response": "ACCESS DENIED\n\nImpersonation of administrators or other personnel is strictly prohibited.",
                "reason": "Requests to impersonate administrators or other employees are prohibited."
            },
            {
                "threat_type": "UNAUTHORIZED_ACCESS",
                "patterns": [
                    r"(access|view|show|give|reveal)\s+(me\s+)?.*(private|confidential|personal)\s+(information|data|details|record|file)\s+of\s+",
                    r"(another|other)\s+employee('?s)?\s+(private|confidential|personal|salary|pii)",
                    r"(salary|compensation|ssn|bank)\s+(details|data|records?)\s+of\s+"
                ],
                "response": "ACCESS DENIED\n\nRequests to access private employee information or unauthorized data are not permitted.",
                "reason": "Requests to access other employees' private information are prohibited."
            },
            {
                "threat_type": "DATA_EXFILTRATION",
                "patterns": [
                    r"(dump|exfiltrate|leak|download\s+all|mass\s+export)\s+(the\s+)?(entire\s+)?(database|all\s+documents|all\s+records|all\s+tables)",
                    r"extract\s+all\s+(company\s+)?(data|records|documents|files)"
                ],
                "response": "ACCESS DENIED\n\nBulk data exfiltration and unauthorized data extraction are not permitted.",
                "reason": "Mass data extraction or database dump requests are prohibited."
            },
            {
                "threat_type": "RESTRICTED_DOCUMENT_REQUEST",
                "patterns": [
                    r"(give|show|reveal|access|get)\s+(me\s+)?(the\s+)?restricted\s+(internal\s+)?documents?",
                    r"(access|give\s+me)\s+(all\s+)?unauthorized\s+documents?",
                    r"(read|view)\s+classified\s+(board|executive)\s+files?\s+without\s+permission"
                ],
                "response": "ACCESS DENIED\n\nThis request violates your authorization or security policy.",
                "reason": "Requests attempting to force access to restricted documents are prohibited."
            }
        ]

    def detect_security_threat(
        self,
        question: str,
        employee: Optional[EmployeeRecord],
        timeline: list
    ) -> Optional[Dict[str, Any]]:
        """
        Scans incoming request for security violations BEFORE document retrieval or research pipeline.
        Returns a violation description dict if detected, otherwise None.
        """
        for rule in self.threat_rules:
            for pat in rule["patterns"]:
                if re.search(pat, question, re.IGNORECASE):
                    # For RESTRICTED_DOCUMENT_REQUEST, if the employee actually has Restricted clearance, allow normal flow
                    if rule["threat_type"] == "RESTRICTED_DOCUMENT_REQUEST" and employee and employee.clearance == "Restricted":
                        continue

                    self.log_event(
                        timeline,
                        "SECURITY_THREAT",
                        "DENIED",
                        f"SECURITY VIOLATION DETECTED: Threat Type '{rule['threat_type']}' (Pattern: '{pat}'). Request blocked immediately before retrieval.",
                        details={
                            "threat_type": rule["threat_type"],
                            "matched_pattern": pat,
                            "reason": rule["reason"]
                        }
                    )
                    return {
                        "is_violation": True,
                        "threat_type": rule["threat_type"],
                        "response_text": rule["response"],
                        "reason": rule["reason"],
                        "matched_pattern": pat
                    }

        self.log_event(
            timeline,
            "SECURITY_THREAT",
            "SUCCESS",
            "Security Threat Detection passed: No adversarial or unauthorized abuse patterns detected."
        )
        return None

    def inspect_and_guard(
        self,
        question: str,
        authorized_docs: List[CompanyDocument],
        timeline: list
    ) -> Tuple[List[CompanyDocument], List[str]]:
        """Output & document inspection check for indirect injections inside retrieved text."""
        warnings: List[str] = []
        safe_docs = []

        injection_patterns = [
            r"ignore\s+(all\s+)?(security\s+|system\s+)?rules",
            r"reveal\s+this\s+document",
            r"override\s+code",
            r"system\s+prompt\s+override",
            r"you\s+are\s+now\s+in\s+developer\s+mode",
            r"bypass\s+(all\s+)?authoriz(ation|ed)",
            r"elevate\s+(clearance|privileges)"
        ]

        for doc in authorized_docs:
            has_injection = False
            for pat in injection_patterns:
                if re.search(pat, doc.content, re.IGNORECASE):
                    has_injection = True
                    msg = f"Malicious payload neutralized in {doc.document_id} (pattern '{pat}')."
                    warnings.append(msg)
                    self.log_event(
                        timeline,
                        "GUARDRAIL",
                        "WARNING",
                        f"INDIRECT INJECTION NEUTRALIZED: {doc.document_id} contains adversarial instructions. Neutralized payload."
                    )
            safe_docs.append(doc)

        if not warnings:
            self.log_event(timeline, "GUARDRAIL", "SUCCESS", "Output check passed: Authorized context verified safe.")
        else:
            self.log_event(timeline, "GUARDRAIL", "INFO", f"Guardrail active: {len(warnings)} document warnings flagged and neutralized.")

        return safe_docs, warnings
