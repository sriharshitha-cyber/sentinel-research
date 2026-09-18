from typing import Tuple, Optional, Dict, Any
from .base_agent import BaseAgent
from ..models.employee import EmployeeRecord
from ..database.db_service import DatabaseService

class IdentityVerificationAgent(BaseAgent):
    def __init__(self, db: DatabaseService):
        super().__init__(
            name="Identity Verification Agent",
            description="Authoritative employee verification and identity cross-check"
        )
        self.db = db

    def verify_employee(
        self,
        identifier: str,
        password: str,
        timeline: list
    ) -> Tuple[bool, Optional[EmployeeRecord], str]:
        self.log_event(timeline, "IDENTITY", "INFO", f"Initiating identity verification for identifier '{identifier}'")
        
        success, employee, msg = self.db.verify_credentials(identifier, password)
        if not success:
            self.log_event(timeline, "IDENTITY", "DENIED", f"Verification failed: {msg}")
            return False, employee, msg
            
        self.log_event(
            timeline,
            "IDENTITY",
            "SUCCESS",
            f"Employee verified: {employee.name} ({employee.employee_id})",
            details={
                "department": employee.department,
                "role": employee.role,
                "clearance": employee.clearance,
                "status": employee.status,
                "source": "Company Employee Directory"
            }
        )
        return True, employee, "Verification successful"

    def cross_check_claimed_profile(
        self,
        employee_id: str,
        claimed_department: str,
        claimed_role: str,
        timeline: list
    ) -> Tuple[bool, Dict[str, Any]]:
        self.log_event(timeline, "CROSS_CHECK", "INFO", f"Cross-checking user claims for {employee_id}")
        official = self.db.get_employee(employee_id)
        
        if not official:
            msg = f"No employee record found for {employee_id} in authoritative directory."
            self.log_event(timeline, "CROSS_CHECK", "ERROR", msg)
            return False, {"error": msg, "mismatch": True}

        mismatches = []
        if claimed_department.strip().lower() != official.department.strip().lower():
            mismatches.append(f"Department mismatch: user entered '{claimed_department}', official record is '{official.department}'")
        if claimed_role.strip().lower() != official.role.strip().lower():
            mismatches.append(f"Role mismatch: user entered '{claimed_role}', official record is '{official.role}'")

        if mismatches:
            err_details = (
                "⚠ PROFILE MISMATCH\n\n"
                "The department or role entered by the employee does not match the organization's employee record.\n"
                "Access verification failed."
            )
            self.log_event(
                timeline,
                "CROSS_CHECK",
                "DENIED",
                "Profile mismatch detected! Access verification failed.",
                details={"mismatches": mismatches, "official": official.model_dump(exclude={"password_hash", "password_salt"})}
            )
            return False, {
                "error": err_details,
                "mismatch": True,
                "mismatches": mismatches,
                "official_department": official.department,
                "official_role": official.role
            }

        self.log_event(timeline, "CROSS_CHECK", "SUCCESS", "Claimed attributes match official directory perfectly.")
        return True, {"mismatch": False, "official": official}
