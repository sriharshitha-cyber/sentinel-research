import re
from typing import Dict, Any, List
from .base_agent import BaseAgent

class QueryUnderstandingAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Query Understanding Agent",
            description="Extracts semantic intents, temporal parameters, and retrieval terms"
        )

    def process_query(self, question: str, timeline: list) -> Dict[str, Any]:
        self.log_event(timeline, "QUERY", "INFO", f"Parsing natural language query: '{question}'")
        
        q_lower = question.lower()
        
        # Detect temporal constraints
        timeframe = None
        if "q4" in q_lower:
            timeframe = "Q4"
        elif "q3" in q_lower:
            timeframe = "Q3"
        elif "q2" in q_lower:
            timeframe = "Q2"
        elif "q1" in q_lower:
            timeframe = "Q1"
        elif "october" in q_lower:
            timeframe = "October 2026"

        # Detect intent
        intent = "General Inquiry"
        if "revenue" in q_lower or "forecast" in q_lower or "budget" in q_lower or "financial" in q_lower:
            intent = "Revenue forecast"
        elif "roadmap" in q_lower or "release" in q_lower or "platform" in q_lower:
            intent = "Engineering roadmap"
        elif "code of conduct" in q_lower or "policy" in q_lower or "charter" in q_lower:
            intent = "Corporate Governance"

        # Detect requirement
        requirement = "Standard retrieval"
        if "latest" in q_lower or "newest" in q_lower or "most recent" in q_lower or "update" in q_lower:
            requirement = "Latest available authorized information (version check required)"

        # Extract search keywords
        # Tokenize and keep meaningful keywords
        stop_words = {"what", "is", "the", "for", "was", "a", "an", "in", "of", "about", "show", "me", "tell", "give"}
        words = re.findall(r'\b[a-zA-Z0-9_-]+\b', q_lower)
        keywords = [w for w in words if w not in stop_words]

        result = {
            "original_query": question,
            "intent": intent,
            "timeframe": timeframe,
            "requirement": requirement,
            "keywords": keywords
        }

        self.log_event(
            timeline,
            "QUERY",
            "SUCCESS",
            f"Query understood: Intent='{intent}', Timeframe='{timeframe or 'None'}', Requirement='{requirement}'",
            details=result
        )
        return result
