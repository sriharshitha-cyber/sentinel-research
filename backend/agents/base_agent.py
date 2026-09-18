import time
from datetime import datetime
from typing import Dict, Any, Optional
from ..models.audit import TimelineEvent

class BaseAgent:
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    def log_event(
        self,
        timeline: list,
        phase: str,
        event_type: str,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        now_str = datetime.now().strftime("%H:%M:%S")
        event = TimelineEvent(
            timestamp=now_str,
            phase=phase,
            agent_name=self.name,
            event_type=event_type,
            message=message,
            details=details or {}
        )
        timeline.append(event)
        return event
