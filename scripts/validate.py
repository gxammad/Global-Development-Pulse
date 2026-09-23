"""
Module for comprehensive data validation and quality auditing.
Implements multi-layer checks for schema consistency, duplicate detection,
domain rule boundaries, and missing-value statistics.
"""

from typing import Dict, List, Any, Tuple
from scripts.config import COUNTRY_BY_ISO3, INDICATOR_BY_CODE

REQUIRED_FIELDS = [
    "country", "country_code", "country_id", "indicator",
    "indicator_id", "indicator_code", "category", "year",
    "value", "unit", "source", "retrieved_at"
]

def validate_domain_rules(record: Dict[str, Any]) -> List[str]:
    """
    Check domain-specific sanity rules on non-null numeric values.
    Does not delete values; flags any anomalies for transparency.
    """
    anomalies: List[str] = []
    val = record["value"]
    if val is None:
        return anomalies

    code = record["indicator_code"]
    yr = record["year"]
    country = record["country_code"]

    # Basic year boundary
    if not (1990 <= yr <= 2030):
        anomalies.append(f"Invalid year {yr} for {country} {code}")

    # Percentages that cannot exceed 100 or be negative
    zero_to_hundred_indicators = [
        "EG.ELC.ACCS.ZS",  # Electricity access
        "IT.NET.USER.ZS",  # Internet users
        "SL.UEM.TOTL.ZS",  # Unemployment
        "SL.TLF.CACT.ZS",  # Labor force participation
        "SL.EMP.TOTL.SP.ZS", # Employment to population ratio
        "AG.LND.FRST.ZS",  # Forest area
        "AG.LND.AGRI.ZS"   # Agricultural land
    ]
    if code in zero_to_hundred_indicators:
        if val < 0 or val > 100.01:
            anomalies.append(f"Percentage out of [0, 100] range ({val}) for {country} {code}")

    # Life expectancy
    if code == "SP.DYN.LE00.IN":
        if val < 20 or val > 115:
            anomalies.append(f"Life expectancy out of plausible range ({val}) for {country}")

    # Total population & GDP
    if code in ["SP.POP.TOTL", "NY.GDP.MKTP.CD", "NY.GDP.PCAP.CD"]:
        if val <= 0:
            anomalies.append(f"Non-positive value ({val}) for positive-only indicator {code} in {country}")

    return anomalies

def validate_dataset(records: List[Dict[str, Any]], retrieved_at: str) -> Dict[str, Any]:
    """
    Comprehensive validation of the transformed dataset.
    Returns audit metrics and quality report matching specification.
    """
    total_records = len(records)
    missing_values = 0
    duplicates_count = 0
    validation_errors_count = 0
    anomalies_count = 0

    seen_keys = set()
    duplicate_samples: List[str] = []
    error_samples: List[str] = []
    warning_samples: List[str] = []

    for r in records:
        # 1. Schema check
        for field in REQUIRED_FIELDS:
            if field not in r:
                validation_errors_count += 1
                if len(error_samples) < 5:
                    error_samples.append(f"Missing required field '{field}' in record {r}")

        # 2. Country & Indicator registry check
        c_code = r.get("country_code")
        if not c_code or c_code not in COUNTRY_BY_ISO3:
            validation_errors_count += 1
            if len(error_samples) < 5:
                error_samples.append(f"Unrecognized country code: {c_code}")

        i_code = r.get("indicator_code")
        if not i_code or i_code not in INDICATOR_BY_CODE:
            validation_errors_count += 1
            if len(error_samples) < 5:
                error_samples.append(f"Unrecognized indicator code: {i_code}")

        # 3. Duplicate detection
        dup_key = (r.get("country_code"), r.get("indicator_code"), r.get("year"))
        if dup_key in seen_keys:
            duplicates_count += 1
            if len(duplicate_samples) < 5:
                duplicate_samples.append(f"Duplicate entry for {dup_key}")
        else:
            seen_keys.add(dup_key)

        # 4. Missing value auditing
        if r.get("value") is None:
            missing_values += 1

        # 5. Domain boundary check
        domain_errs = validate_domain_rules(r)
        if domain_errs:
            anomalies_count += len(domain_errs)
            if len(warning_samples) < 5:
                warning_samples.extend(domain_errs[:2])

    status = "healthy"
    if validation_errors_count > 0 or duplicates_count > 0:
        status = "failed"
    elif anomalies_count > 10:
        status = "warning"

    quality_report = {
        "status": status,
        "records": total_records,
        "valid_observations": total_records - missing_values,
        "missing_values": missing_values,
        "missing_percentage": round((missing_values / total_records * 100), 2) if total_records > 0 else 0.0,
        "duplicates": duplicates_count,
        "validation_errors": validation_errors_count,
        "domain_warnings": anomalies_count,
        "last_updated": retrieved_at,
        "source": "World Bank Open Data API",
        "error_samples": error_samples,
        "duplicate_samples": duplicate_samples,
        "warning_samples": warning_samples
    }

    return quality_report
