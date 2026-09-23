"""
Master ETL Pipeline Orchestrator for Global Development Pulse.
Orchestrates:
  FETCH -> TRANSFORM -> VALIDATE -> CHANGE DETECTION -> STATS -> VERSIONED OUTPUT
"""

import os
import sys
import json
import hashlib
import argparse
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, Tuple

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from scripts.config import (
    DATA_DIR,
    COUNTRIES_DIR,
    INDICATORS_DIR,
    DEFAULT_YEAR_START,
    DEFAULT_YEAR_END
)
from scripts.fetch_worldbank import fetch_all_indicators
from scripts.transform import transform_all_data
from scripts.validate import validate_dataset
from scripts.generate_stats import calculate_pipeline_health, generate_summary

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("pipeline")

HASH_FILE = DATA_DIR / ".records_hash"

def compute_data_fingerprint(records: list) -> str:
    """
    Computes a deterministic MD5 hash of core data tuples (ignoring retrieved_at timestamp).
    This enables authentic change detection so commits only occur on actual data updates.
    """
    hasher = hashlib.sha256()
    for r in records:
        chunk = f"{r['indicator_code']}|{r['country_code']}|{r['year']}|{r['value']};"
        hasher.update(chunk.encode("utf-8"))
    return hasher.hexdigest()

def ensure_directories():
    """Create all required output directory paths."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    COUNTRIES_DIR.mkdir(parents=True, exist_ok=True)
    INDICATORS_DIR.mkdir(parents=True, exist_ok=True)

def run_pipeline(force: bool = False, year_start: int = DEFAULT_YEAR_START, year_end: int = DEFAULT_YEAR_END) -> int:
    """
    Execute full ETL pipeline.
    Returns:
      0 if successful
      1 if validation failed critically
    """
    ensure_directories()
    start_time = datetime.now(timezone.utc)
    retrieved_at = start_time.isoformat()

    logger.info("=" * 60)
    logger.info("STARTING GLOBAL DEVELOPMENT PULSE DATA PIPELINE")
    logger.info(f"Target Year Range: {year_start} - {year_end}")
    logger.info("=" * 60)

    # 1. FETCH
    logger.info("[Step 1/6] Fetching data from World Bank Open Data API...")
    raw_indicator_dict = fetch_all_indicators(year_start=year_start, year_end=year_end)

    # 2. TRANSFORM
    logger.info("[Step 2/6] Normalizing and transforming datasets...")
    transformed = transform_all_data(raw_indicator_dict, retrieved_at=retrieved_at)
    records = transformed["records"]
    logger.info(f"Normalized {len(records)} observation records.")

    # 3. VALIDATE
    logger.info("[Step 3/6] Running multi-layer schema and domain validation...")
    quality_report = validate_dataset(records, retrieved_at)
    logger.info(
        f"Validation Result: status={quality_report['status']}, "
        f"missing={quality_report['missing_values']} ({quality_report['missing_percentage']}%), "
        f"duplicates={quality_report['duplicates']}, "
        f"errors={quality_report['validation_errors']}"
    )

    if quality_report["validation_errors"] > 0:
        logger.error(f"Critical validation failures: {quality_report['error_samples']}")
        return 1

    # 4. CHANGE DETECTION
    logger.info("[Step 4/6] Executing change detection against current version...")
    current_fingerprint = compute_data_fingerprint(records)
    previous_fingerprint = ""
    if HASH_FILE.exists():
        try:
            previous_fingerprint = HASH_FILE.read_text().strip()
        except Exception:
            previous_fingerprint = ""

    data_changed = (current_fingerprint != previous_fingerprint)
    records_changed = len(records) if data_changed else 0

    if not data_changed and not force:
        logger.info("-" * 60)
        logger.info("[CHANGE DETECTION] No underlying data changes detected from World Bank.")
        logger.info("Skipping file rewrites to preserve Git history and avoid empty commits.")
        logger.info("-" * 60)
        # Update pipeline health run timestamp without modifying data files
        health = calculate_pipeline_health(quality_report, records_changed=0)
        with open(DATA_DIR / "pipeline_health.json", "w", encoding="utf-8") as f:
            json.dump(health, f, indent=2)
        print("PIPELINE_STATUS: UNCHANGED")
        return 0

    logger.info(f"[CHANGE DETECTION] Data change confirmed! (Force={force}) Writing new datasets.")

    # 5. GENERATE STATS & HEALTH
    logger.info("[Step 5/6] Generating summary statistics and pipeline health...")
    health = calculate_pipeline_health(quality_report, records_changed=records_changed)
    summary = generate_summary(transformed, quality_report, health)

    # 6. OUTPUT FILES
    logger.info("[Step 6/6] Emitting optimized JSON files into data/processed/...")

    # Write summary, health, and quality report
    with open(DATA_DIR / "summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    with open(DATA_DIR / "pipeline_health.json", "w", encoding="utf-8") as f:
        json.dump(health, f, indent=2)

    with open(DATA_DIR / "quality_report.json", "w", encoding="utf-8") as f:
        json.dump(quality_report, f, indent=2)

    with open(DATA_DIR / "country_index.json", "w", encoding="utf-8") as f:
        json.dump(transformed["country_index"], f, indent=2)

    with open(DATA_DIR / "indicator_index.json", "w", encoding="utf-8") as f:
        json.dump(transformed["indicator_index"], f, indent=2)

    # Write per-country datasets
    for c_id, c_data in transformed["countries"].items():
        country_file = COUNTRIES_DIR / f"{c_id}.json"
        with open(country_file, "w", encoding="utf-8") as f:
            json.dump(c_data, f, indent=2)

    # Write per-indicator datasets
    for ind_id, ind_data in transformed["indicators"].items():
        indicator_file = INDICATORS_DIR / f"{ind_id}.json"
        with open(indicator_file, "w", encoding="utf-8") as f:
            json.dump(ind_data, f, indent=2)

    # Save new fingerprint
    HASH_FILE.write_text(current_fingerprint, encoding="utf-8")

    duration = (datetime.now(timezone.utc) - start_time).total_seconds()
    logger.info("=" * 60)
    logger.info(f"PIPELINE COMPLETED SUCCESSFULLY in {duration:.1f}s")
    logger.info(f"Written: 15 countries, 30 indicators, {len(records)} normalized records.")
    logger.info("=" * 60)
    print("PIPELINE_STATUS: UPDATED")
    return 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Global Development Pulse ETL Pipeline")
    parser.add_argument("--force", action="store_true", help="Force dataset generation even if unchanged")
    parser.add_argument("--start-year", type=int, default=DEFAULT_YEAR_START, help="Start year")
    parser.add_argument("--end-year", type=int, default=DEFAULT_YEAR_END, help="End year")
    args = parser.parse_args()

    exit_code = run_pipeline(force=args.force, year_start=args.start_year, year_end=args.end_year)
    sys.exit(exit_code)
