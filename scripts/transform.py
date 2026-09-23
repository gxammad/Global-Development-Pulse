"""
Module for normalizing and transforming raw World Bank data into structured,
typed, and query-optimized JSON datasets for both backend validation and frontend consumption.
"""

from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import math

from scripts.config import (
    COUNTRIES,
    INDICATORS,
    COUNTRY_BY_ISO3,
    INDICATOR_BY_CODE,
    INDICATOR_BY_ID
)

def normalize_raw_record(
    raw: Dict[str, Any],
    retrieved_at: str
) -> Optional[Dict[str, Any]]:
    """
    Normalize a single raw record from the World Bank API response.
    Preserves missing values explicitly without dropping records silently.
    """
    country_iso3 = raw.get("countryiso3code")
    if not country_iso3 or country_iso3 not in COUNTRY_BY_ISO3:
        # Fallback check country.id if iso3 was empty
        country_obj = raw.get("country", {})
        c_id = country_obj.get("id") if isinstance(country_obj, dict) else None
        if c_id in COUNTRY_BY_ISO3:
            country_iso3 = c_id
        else:
            return None

    country_meta = COUNTRY_BY_ISO3[country_iso3]

    ind_obj = raw.get("indicator", {})
    ind_code = ind_obj.get("id") if isinstance(ind_obj, dict) else raw.get("indicator_code")
    if not ind_code or ind_code not in INDICATOR_BY_CODE:
        return None

    ind_meta = INDICATOR_BY_CODE[ind_code]

    raw_date = raw.get("date")
    try:
        year = int(raw_date)
    except (ValueError, TypeError):
        return None

    raw_value = raw.get("value")
    clean_value: Optional[float] = None
    if raw_value is not None:
        try:
            val_float = float(raw_value)
            if not (math.isnan(val_float) or math.isinf(val_float)):
                clean_value = round(val_float, 4)
        except (ValueError, TypeError):
            clean_value = None

    return {
        "country": country_meta["name"],
        "country_code": country_iso3,
        "country_id": country_meta["id"],
        "indicator": ind_meta["name"],
        "indicator_id": ind_meta["id"],
        "indicator_code": ind_code,
        "category": ind_meta["category"],
        "year": year,
        "value": clean_value,
        "unit": ind_meta["unit"],
        "source": "World Bank",
        "retrieved_at": retrieved_at
    }

def transform_all_data(
    raw_indicator_dict: Dict[str, List[Dict[str, Any]]],
    retrieved_at: Optional[str] = None
) -> Dict[str, Any]:
    """
    Transforms raw responses into normalized master records,
    per-country historical files, per-indicator comparison files,
    and fast lookup indices.
    """
    if retrieved_at is None:
        retrieved_at = datetime.now(timezone.utc).isoformat()

    all_normalized_records: List[Dict[str, Any]] = []

    for ind_id, raw_records in raw_indicator_dict.items():
        for record in raw_records:
            normalized = normalize_raw_record(record, retrieved_at)
            if normalized:
                all_normalized_records.append(normalized)

    # Sort records deterministically by indicator_id, country_code, year
    all_normalized_records.sort(
        key=lambda r: (r["indicator_id"], r["country_code"], r["year"])
    )

    # Group by Country
    countries_data: Dict[str, Dict[str, Any]] = {}
    for country in COUNTRIES:
        iso3 = country["iso3"]
        c_id = country["id"]
        countries_data[c_id] = {
            "country": country,
            "indicators": {},
            "summary_metrics": {}
        }
        for ind in INDICATORS:
            countries_data[c_id]["indicators"][ind["id"]] = {
                "metadata": ind,
                "time_series": [],
                "latest_year": None,
                "latest_value": None,
                "data_points_count": 0,
                "coverage_percent": 0.0
            }

    # Group by Indicator
    indicators_data: Dict[str, Dict[str, Any]] = {}
    for ind in INDICATORS:
        ind_id = ind["id"]
        indicators_data[ind_id] = {
            "indicator": ind,
            "countries": {}
        }
        for country in COUNTRIES:
            indicators_data[ind_id]["countries"][country["iso3"]] = {
                "country": country,
                "time_series": [],
                "latest_year": None,
                "latest_value": None
            }

    # Populate time series
    for record in all_normalized_records:
        c_id = record["country_id"]
        iso3 = record["country_code"]
        ind_id = record["indicator_id"]
        val = record["value"]
        yr = record["year"]

        # Per Country structure
        c_series = countries_data[c_id]["indicators"][ind_id]["time_series"]
        c_series.append({
            "year": yr,
            "value": val
        })

        # Per Indicator structure
        ind_series = indicators_data[ind_id]["countries"][iso3]["time_series"]
        ind_series.append({
            "year": yr,
            "value": val
        })

    # Post-process metrics, latest values, and coverage
    for c_id, c_obj in countries_data.items():
        for ind_id, ind_obj in c_obj["indicators"].items():
            ts = ind_obj["time_series"]
            # Sort time_series chronologically
            ts.sort(key=lambda item: item["year"])
            non_null = [item for item in ts if item["value"] is not None]
            total_points = len(ts)
            valid_points = len(non_null)
            ind_obj["data_points_count"] = valid_points
            ind_obj["coverage_percent"] = (
                round((valid_points / total_points) * 100, 1) if total_points > 0 else 0.0
            )
            if non_null:
                latest = max(non_null, key=lambda item: item["year"])
                ind_obj["latest_year"] = latest["year"]
                ind_obj["latest_value"] = latest["value"]

        # Populate summary key stats for country card previews
        key_ind_map = {
            "gdp": "gdp_current_usd",
            "gdp_per_capita": "gdp_per_capita_usd",
            "population": "population_total",
            "life_expectancy": "life_expectancy_birth",
            "unemployment": "unemployment_rate",
            "internet_users": "internet_users_percent"
        }
        for key_name, target_id in key_ind_map.items():
            if target_id in c_obj["indicators"]:
                target = c_obj["indicators"][target_id]
                c_obj["summary_metrics"][key_name] = {
                    "value": target["latest_value"],
                    "year": target["latest_year"],
                    "unit": target["metadata"]["unit"],
                    "format": target["metadata"]["format"]
                }

    # Post-process indicator latest values
    for ind_id, ind_obj in indicators_data.items():
        for iso3, c_sub in ind_obj["countries"].items():
            ts = c_sub["time_series"]
            ts.sort(key=lambda item: item["year"])
            non_null = [item for item in ts if item["value"] is not None]
            if non_null:
                latest = max(non_null, key=lambda item: item["year"])
                c_sub["latest_year"] = latest["year"]
                c_sub["latest_value"] = latest["value"]

    # Build Country Directory Index
    country_index = []
    for country in COUNTRIES:
        c_id = country["id"]
        c_obj = countries_data[c_id]
        total_slots = sum(len(i["time_series"]) for i in c_obj["indicators"].values())
        valid_slots = sum(i["data_points_count"] for i in c_obj["indicators"].values())
        avg_coverage = round((valid_slots / total_slots) * 100, 1) if total_slots > 0 else 0.0

        country_index.append({
            **country,
            "summary_metrics": c_obj["summary_metrics"],
            "coverage_percent": avg_coverage,
            "tracked_indicators_count": len(c_obj["indicators"])
        })

    # Build Indicator Directory Index
    indicator_index = []
    for ind in INDICATORS:
        ind_id = ind["id"]
        ind_obj = indicators_data[ind_id]
        countries_with_data = sum(
            1 for c_sub in ind_obj["countries"].values() if c_sub["latest_value"] is not None
        )
        all_latest_years = [
            c_sub["latest_year"] for c_sub in ind_obj["countries"].values() if c_sub["latest_year"]
        ]
        max_year = max(all_latest_years) if all_latest_years else None

        indicator_index.append({
            **ind,
            "reporting_countries_count": countries_with_data,
            "total_countries_count": len(COUNTRIES),
            "latest_global_year": max_year
        })

    return {
        "records": all_normalized_records,
        "countries": countries_data,
        "indicators": indicators_data,
        "country_index": country_index,
        "indicator_index": indicator_index,
        "retrieved_at": retrieved_at
    }
