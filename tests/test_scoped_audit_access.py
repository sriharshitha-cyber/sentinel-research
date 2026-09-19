import unittest
from fastapi.testclient import TestClient
from backend.main import app, db_service
from backend.pipeline import SentinelPipeline

class TestScopedAuditAccess(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.pipeline = SentinelPipeline(db_service)
        # Seed test queries to ensure audit logs exist across departments
        cls.pipeline.execute_query("U102", "What is the projected revenue for Q4?") # Finance
        cls.pipeline.execute_query("U205", "What are the Q3 marketing campaigns?")  # Marketing
        cls.pipeline.execute_query("A901", "What is the status of Project Titan?")  # Executive/Engineering

    def test_admin_inspect_all_departments(self):
        """Admin A901 can inspect every audit log across all corporate departments."""
        resp = self.client.get("/api/audit", params={"viewer_id": "A901"})
        self.assertEqual(resp.status_code, 200)
        logs = resp.json()
        self.assertGreater(len(logs), 0)

        depts = {r.get("department") for r in logs}
        # Admin must see multiple different departments
        self.assertTrue(len(depts) >= 2, f"Admin should see multi-department audit logs, saw: {depts}")

    def test_finance_manager_scoped_to_finance_only(self):
        """Finance Manager M301 can inspect ONLY Finance records."""
        resp = self.client.get("/api/audit", params={"viewer_id": "M301"})
        self.assertEqual(resp.status_code, 200)
        logs = resp.json()
        self.assertGreater(len(logs), 0)

        for record in logs:
            dept = record.get("department")
            user_dept = record.get("user_department")
            is_finance = (dept and dept.lower() == "finance") or (user_dept and user_dept.lower() == "finance")
            self.assertTrue(
                is_finance,
                f"Finance Manager M301 received unauthorized record: dept={dept}, user_dept={user_dept}"
            )

    def test_marketing_manager_scoped_to_marketing_only(self):
        """Marketing Manager M302 can inspect ONLY Marketing records."""
        resp = self.client.get("/api/audit", params={"viewer_id": "M302"})
        self.assertEqual(resp.status_code, 200)
        logs = resp.json()
        self.assertGreater(len(logs), 0)

        for record in logs:
            dept = record.get("department")
            user_dept = record.get("user_department")
            is_mkt = (dept and dept.lower() == "marketing") or (user_dept and user_dept.lower() == "marketing")
            self.assertTrue(
                is_mkt,
                f"Marketing Manager M302 received unauthorized record: dept={dept}, user_dept={user_dept}"
            )

    def test_regular_employee_scoped_to_self_only(self):
        """Regular employee U102 can inspect ONLY their own requests."""
        resp = self.client.get("/api/audit", params={"viewer_id": "U102"})
        self.assertEqual(resp.status_code, 200)
        logs = resp.json()
        self.assertGreater(len(logs), 0)

        for record in logs:
            self.assertEqual(
                record.get("user_id", "").upper(),
                "U102",
                f"Employee U102 received record belonging to another user: {record.get('user_id')}"
            )

    def test_audit_detail_authorization_enforcement(self):
        """GET /api/audit/{request_id} returns 403 Forbidden when unauthorized inspection is attempted."""
        all_logs = self.client.get("/api/audit", params={"viewer_id": "A901"}).json()
        finance_rec = next((r for r in all_logs if r.get("department") == "Finance" and r.get("user_id") == "U102"), None)
        marketing_rec = next((r for r in all_logs if r.get("department") == "Marketing" and r.get("user_id") == "U205"), None)

        self.assertIsNotNone(finance_rec)
        self.assertIsNotNone(marketing_rec)

        # Admin can view both
        res_admin_fin = self.client.get(f"/api/audit/{finance_rec['request_id']}", params={"viewer_id": "A901"})
        self.assertEqual(res_admin_fin.status_code, 200)
        res_admin_mkt = self.client.get(f"/api/audit/{marketing_rec['request_id']}", params={"viewer_id": "A901"})
        self.assertEqual(res_admin_mkt.status_code, 200)

        # Finance Manager can inspect Finance record, but 403 on Marketing record
        res_mgr_fin = self.client.get(f"/api/audit/{finance_rec['request_id']}", params={"viewer_id": "M301"})
        self.assertEqual(res_mgr_fin.status_code, 200)
        res_mgr_mkt = self.client.get(f"/api/audit/{marketing_rec['request_id']}", params={"viewer_id": "M301"})
        self.assertEqual(res_mgr_mkt.status_code, 403)
        self.assertIn("Managers are authorized to inspect Finance division records only", res_mgr_mkt.json()["detail"])

        # Regular employee U102 can inspect own record, but 403 on another employee's record
        res_emp_own = self.client.get(f"/api/audit/{finance_rec['request_id']}", params={"viewer_id": "U102"})
        self.assertEqual(res_emp_own.status_code, 200)
        res_emp_other = self.client.get(f"/api/audit/{marketing_rec['request_id']}", params={"viewer_id": "U102"})
        self.assertEqual(res_emp_other.status_code, 403)
        self.assertIn("Employees are only authorized to inspect their own requests", res_emp_other.json()["detail"])

if __name__ == "__main__":
    unittest.main()
