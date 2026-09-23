"""
Unit tests for Global Development Pulse ETL Pipeline.
Tests data transformations, schema validation, domain rule boundaries,
fingerprinting for change detection, and health statistics calculation.
"""

import unittest
from datetime import datetime, timezone

from scripts.config import COUNTRIES, INDICATORS, COUNTRY_BY_ISO3, INDICATOR_BY_CODE
from scripts.transform import normalize_raw_record, transform_all_data
from scripts.validate import validate_dataset, validate_domain_rules
from scripts.generate_stats import calculate_pipeline_health, generate_summary
from scripts.pipeline import compute_data_fingerprint

class TestPipelineETL(unittest.TestCase):

    def setUp(self):
        self.retrieved_at = datetime.now(timezone.utc).isoformat()
        self.sample_raw_pak_gdp = {
            "indicator": {"id": "NY.GDP.MKTP.CD", "value": "GDP (current US$)"},
            "country": {"id": "PK", "value": "Pakistan"},
            "countryiso3code": "PAK",
            "date": "2023",
            "value": 338367980000.0,
            "unit": "",
            "obs_status": "",
            "decimal": 0
        }
        self.sample_raw_null_value = {
            "indicator": {"id": "NY.GDP.MKTP.CD", "value": "GDP (current US$)"},
            "country": {"id": "PK", "value": "Pakistan"},
            "countryiso3code": "PAK",
            "date": "2022",
            "value": None,
            "unit": "",
            "obs_status": "",
            "decimal": 0
        }

    def test_country_and_indicator_registries(self):
        """Verify centralized registries have expected counts and unique IDs."""
        self.assertEqual(len(COUNTRIES), 15)
        self.assertEqual(len(INDICATORS), 30)
        
        iso3_set = set(c["iso3"] for c in COUNTRIES)
        self.assertEqual(len(iso3_set), 15)
        
        code_set = set(i["code"] for i in INDICATORS)
        self.assertEqual(len(code_set), 30)

    def test_normalize_valid_record(self):
        """Test transformation of valid raw World Bank record into normalized schema."""
        norm = normalize_raw_record(self.sample_raw_pak_gdp, self.retrieved_at)
        self.assertIsNotNone(norm)
        self.assertEqual(norm["country"], "Pakistan")
        self.assertEqual(norm["country_code"], "PAK")
        self.assertEqual(norm["country_id"], "pakistan")
        self.assertEqual(norm["indicator_id"], "gdp_current_usd")
        self.assertEqual(norm["year"], 2023)
        self.assertEqual(norm["value"], 338367980000.0)
        self.assertEqual(norm["unit"], "current US$")
        self.assertEqual(norm["source"], "World Bank")

    def test_preserve_missing_value_record(self):
        """Test that missing/null values are explicitly preserved and not dropped."""
        norm = normalize_raw_record(self.sample_raw_null_value, self.retrieved_at)
        self.assertIsNotNone(norm)
        self.assertIsNone(norm["value"])
        self.assertEqual(norm["year"], 2022)

    def test_validation_detects_duplicates(self):
        """Test that the validator flags duplicate records."""
        rec1 = normalize_raw_record(self.sample_raw_pak_gdp, self.retrieved_at)
        rec2 = normalize_raw_record(self.sample_raw_pak_gdp, self.retrieved_at)
        records = [rec1, rec2]

        report = validate_dataset(records, self.retrieved_at)
        self.assertEqual(report["duplicates"], 1)
        self.assertEqual(report["status"], "failed")

    def test_domain_rules_boundary_checks(self):
        """Test domain rules against impossible percentage and life expectancy values."""
        invalid_electricity = {
            "country_code": "PAK",
            "indicator_code": "EG.ELC.ACCS.ZS",
            "year": 2020,
            "value": 150.0  # Invalid > 100%
        }
        anomalies = validate_domain_rules(invalid_electricity)
        self.assertGreater(len(anomalies), 0)

        invalid_life_exp = {
            "country_code": "USA",
            "indicator_code": "SP.DYN.LE00.IN",
            "year": 2020,
            "value": 150.0  # Invalid > 115 years
        }
        anomalies = validate_domain_rules(invalid_life_exp)
        self.assertGreater(len(anomalies), 0)

    def test_fingerprint_deterministic_change_detection(self):
        """Verify content fingerprint remains identical for unchanged data and alters on change."""
        rec1 = {"indicator_code": "A", "country_code": "PAK", "year": 2020, "value": 100}
        rec2 = {"indicator_code": "B", "country_code": "IND", "year": 2020, "value": 200}
        
        fp1 = compute_data_fingerprint([rec1, rec2])
        fp2 = compute_data_fingerprint([rec1, rec2])
        self.assertEqual(fp1, fp2)

        # Altering a value should change the fingerprint
        rec2_changed = {"indicator_code": "B", "country_code": "IND", "year": 2020, "value": 205}
        fp3 = compute_data_fingerprint([rec1, rec2_changed])
        self.assertNotEqual(fp1, fp3)

    def test_calculate_pipeline_health_status(self):
        """Test health status logic."""
        healthy_report = {
            "status": "healthy",
            "records": 1000,
            "missing_values": 50,
            "missing_percentage": 5.0,
            "duplicates": 0,
            "validation_errors": 0
        }
        health = calculate_pipeline_health(healthy_report, records_changed=1000)
        self.assertEqual(health["status"], "Healthy")

        failed_report = {
            "status": "failed",
            "records": 1000,
            "missing_values": 50,
            "missing_percentage": 5.0,
            "duplicates": 5,
            "validation_errors": 2
        }
        health_fail = calculate_pipeline_health(failed_report, records_changed=0)
        self.assertEqual(health_fail["status"], "Failed")

if __name__ == "__main__":
    unittest.main()
