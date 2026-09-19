import unittest
from backend.database.db_service import DatabaseService
from backend.pipeline import SentinelPipeline

class TestTwoTierVerification(unittest.TestCase):
    def setUp(self):
        self.db = DatabaseService()
        self.pipeline = SentinelPipeline(self.db)

    def test_step1_allowed_step2_content_redacted(self):
        """Step 1 (Document Gate) allows DOC-101 for U102, but Step 2 redacts Restricted acquisition margin."""
        resp = self.pipeline.execute_query("U102", "What is the projected revenue for Q4?")
        self.assertEqual(resp.status, "SUCCESS")
        self.assertIn("120 crore", resp.answer)
        self.assertTrue(resp.content_redacted)
        self.assertGreaterEqual(resp.redacted_sections_count, 1)
        self.assertIn("[REDACTED: Requires Restricted Clearance]", resp.answer)
        self.assertNotIn("25 crore", resp.answer)

    def test_step1_allowed_step2_full_unredacted_for_executive(self):
        """Executive A901 with Restricted clearance sees full unredacted content in Step 2."""
        resp = self.pipeline.execute_query("A901", "What is the projected revenue for Q4?")
        self.assertEqual(resp.status, "SUCCESS")
        self.assertFalse(resp.content_redacted)
        self.assertEqual(resp.redacted_sections_count, 0)
        self.assertNotIn("[REDACTED", resp.answer)

    def test_step1_denied_step2_never_reached(self):
        """Unauthorized employee U205 is denied at Step 1; Step 2 is never reached and zero data is leaked."""
        resp = self.pipeline.execute_query("U205", "What is the projected revenue for Q4?")
        self.assertEqual(resp.status, "ACCESS_LIMITED")
        self.assertFalse(resp.content_redacted)
        self.assertIsNone(resp.visual_data)
        self.assertEqual(len(resp.citations), 0)

if __name__ == "__main__":
    unittest.main()
