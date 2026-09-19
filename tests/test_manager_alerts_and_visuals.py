import unittest
from backend.database.db_service import DatabaseService
from backend.pipeline import SentinelPipeline

class TestManagerAlertsAndVisuals(unittest.TestCase):
    def setUp(self):
        self.db = DatabaseService()
        self.pipeline = SentinelPipeline(self.db)

    def test_manager_authentication(self):
        """Managers M301, M302, M303 authenticate with default password '678910'."""
        for mgr_id, dept in [("M301", "Finance"), ("M302", "Marketing"), ("M303", "Engineering")]:
            success, emp, msg = self.db.verify_credentials(mgr_id, "678910")
            self.assertTrue(success, f"Manager {mgr_id} authentication failed: {msg}")
            self.assertEqual(emp.department, dept)
            self.assertTrue(emp.is_manager)

    def test_visual_data_generation_authorized_only(self):
        """Visual data (charts, pie chart, KPIs) is generated ONLY for authorized queries."""
        resp_auth = self.pipeline.execute_query("U102", "What is the projected revenue for Q4?")
        self.assertEqual(resp_auth.status, "SUCCESS")
        self.assertIsNotNone(resp_auth.visual_data)
        self.assertEqual(resp_auth.visual_data["year"], "2026")
        self.assertEqual(len(resp_auth.visual_data["monthly_breakdown"]), 12)
        self.assertTrue(len(resp_auth.visual_data["pie_chart"]) > 0)
        self.assertTrue(len(resp_auth.visual_data["kpis"]) > 0)

        # Unauthorized query: zero visual data leakage
        resp_unauth = self.pipeline.execute_query("U205", "What is the projected revenue for Q4?")
        self.assertIsNone(resp_unauth.visual_data)

    def test_manager_alert_on_unauthorized_access(self):
        """Unauthorized access attempts generate targeted manager alerts for the relevant department."""
        # U205 (Marketing) attempts to access DOC-101 (Finance)
        self.pipeline.execute_query("U205", "What is the projected revenue for Q4?")
        alerts = self.db.get_manager_alerts("M301")
        self.assertTrue(len(alerts) > 0)
        u205_alerts = [a for a in alerts if a.get("user_id") == "U205"]
        self.assertTrue(len(u205_alerts) > 0)

        # Test dismiss alert
        alert_id = u205_alerts[0]["alert_id"]
        res = self.db.dismiss_manager_alert(alert_id, "M301")
        self.assertTrue(res)
        updated_alerts = self.db.get_manager_alerts("M301")
        target = next(a for a in updated_alerts if a.get("alert_id") == alert_id)
        self.assertTrue(target["dismissed"])

if __name__ == "__main__":
    unittest.main()
