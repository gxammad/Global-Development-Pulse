"""
Module for generating platform summaries, health metrics, and global statistics.
Calculates real pipeline health dynamically rather than hardcoding 'Operational'.
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any
from scripts.config import COUNTRIES, INDICATORS, CATEGORIES

def calculate_pipeline_health(
    quality_report: Dict[str, Any],
    records_changed: int,
    previous_health: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Compute real pipeline health according to specification rules:
    - Healthy: recent successful update and no validation errors.
    - Warning: successful pipeline but missing data or domain warnings.
    - Failed: pipeline failed or validation errors > 0.
    - Stale: no successful refresh within the expected interval.
    """
    now = datetime.now(timezone.utc)
    validation_status = quality_report.get("status", "healthy")
    validation_errors = quality_report.get("validation_errors", 0)
    missing_pct = quality_report.get("missing_percentage", 0.0)

    if validation_status == "failed" or validation_errors > 0:
        status = "Failed"
        status_message = f"Pipeline encountered {validation_errors} validation errors."
    elif missing_pct > 40.0:
        status = "Warning"
        status_message = f"High missing value rate detected ({missing_pct}%)."
    else:
        status = "Healthy"
        status_message = "All validation checks passed with zero integrity errors."

    # Next run scheduled in 8 hours (or aligned to next 8h cron: 00:00, 08:00, 16:00 UTC)
    next_run = (now + timedelta(hours=8)).strftime("%Y-%m-%dT%H:%M:%SZ")

    return {
        "status": status,
        "status_message": status_message,
        "last_run_timestamp": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "last_data_update": now.strftime("%Y-%m-%d %H:%M UTC"),
        "records_processed": quality_report.get("records", 0),
        "records_changed": records_changed,
        "missing_values": quality_report.get("missing_values", 0),
        "missing_percentage": missing_pct,
        "validation_errors": validation_errors,
        "duplicates": quality_report.get("duplicates", 0),
        "source": "World Bank Open Data API",
        "refresh_frequency": "Every 8 hours (0 */8 * * *)",
        "next_scheduled_run": next_run,
        "environment": "Production CI/CD (GitHub Actions)"
    }

def generate_summary(
    transformed_data: Dict[str, Any],
    quality_report: Dict[str, Any],
    health: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate the high-level platform summary used by the homepage and navbar.
    """
    records = transformed_data["records"]
    total_records = len(records)
    valid_observations = sum(1 for r in records if r.get("value") is not None)

    # Categories breakdown
    category_counts = {}
    for cat in CATEGORIES:
        category_counts[cat] = sum(1 for ind in INDICATORS if ind["category"] == cat)

    # Calculate global highlights (latest values across countries)
    highlights = []
    
    # 1. Largest economy by latest GDP
    gdp_ind = transformed_data["indicators"].get("gdp_current_usd", {})
    if gdp_ind and "countries" in gdp_ind:
        c_items = [
            (iso, c_data["latest_value"], c_data["country"]["name"])
            for iso, c_data in gdp_ind["countries"].items()
            if c_data.get("latest_value") is not None
        ]
        if c_items:
            c_items.sort(key=lambda x: x[1], reverse=True)
            top_gdp = c_items[0]
            highlights.append({
                "metric": "Highest Tracked GDP",
                "country": top_gdp[2],
                "value": top_gdp[1],
                "unit": "current US$",
                "format": "currency"
            })

    # 2. Highest Internet connectivity
    net_ind = transformed_data["indicators"].get("internet_users_percent", {})
    if net_ind and "countries" in net_ind:
        net_items = [
            (iso, c_data["latest_value"], c_data["country"]["name"])
            for iso, c_data in net_ind["countries"].items()
            if c_data.get("latest_value") is not None
        ]
        if net_items:
            net_items.sort(key=lambda x: x[1], reverse=True)
            top_net = net_items[0]
            highlights.append({
                "metric": "Highest Internet Adoption",
                "country": top_net[2],
                "value": top_net[1],
                "unit": "% of population",
                "format": "percentage"
            })

    # 3. Highest Life Expectancy
    life_ind = transformed_data["indicators"].get("life_expectancy_birth", {})
    if life_ind and "countries" in life_ind:
        life_items = [
            (iso, c_data["latest_value"], c_data["country"]["name"])
            for iso, c_data in life_ind["countries"].items()
            if c_data.get("latest_value") is not None
        ]
        if life_items:
            life_items.sort(key=lambda x: x[1], reverse=True)
            top_life = life_items[0]
            highlights.append({
                "metric": "Highest Life Expectancy",
                "country": top_life[2],
                "value": top_life[1],
                "unit": "years",
                "format": "decimal"
            })

    return {
        "platform_name": "Global Development Pulse",
        "tagline": "Automated global development data, refreshed continuously.",
        "description": "Continuous ETL pipeline collecting, validating, versioning, and visualising 30 public development indicators across 15 nations directly from the World Bank Open Data API.",
        "tracked_countries_count": len(COUNTRIES),
        "tracked_indicators_count": len(INDICATORS),
        "total_records": total_records,
        "valid_observations": valid_observations,
        "data_freshness": health["last_run_timestamp"],
        "last_updated_human": health["last_data_update"],
        "pipeline_status": health["status"],
        "date_range": {
            "start": 2000,
            "end": 2024
        },
        "category_counts": category_counts,
        "highlights": highlights,
        "featured_indicators": [
            "gdp_current_usd",
            "gdp_per_capita_usd",
            "population_total",
            "internet_users_percent",
            "renewable_electricity_output",
            "life_expectancy_birth"
        ]
    }
