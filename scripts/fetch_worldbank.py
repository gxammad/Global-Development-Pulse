"""
Module for fetching raw indicator data from the World Bank Open Data API.
Handles pagination, retries with exponential backoff, rate limits, and concurrent fetching.
"""

import time
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Any, Optional, Tuple
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from scripts.config import (
    COUNTRIES,
    INDICATORS,
    API_BASE_URL,
    DEFAULT_YEAR_START,
    DEFAULT_YEAR_END,
    REQUEST_TIMEOUT_SECONDS,
    MAX_RETRIES,
    BACKOFF_FACTOR,
)

logger = logging.getLogger(__name__)

USER_AGENT = "GlobalDevelopmentPulse/1.0 (+https://github.com/global-development-pulse)"

def get_http_session() -> requests.Session:
    """Create a configured requests Session with automatic retries."""
    session = requests.Session()
    retries = Retry(
        total=MAX_RETRIES,
        backoff_factor=BACKOFF_FACTOR,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    adapter = HTTPAdapter(max_retries=retries, pool_connections=10, pool_maxsize=20)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update({
        "User-Agent": USER_AGENT,
        "Accept": "application/json"
    })
    return session

def fetch_indicator_for_countries(
    session: requests.Session,
    indicator_code: str,
    country_codes: List[str],
    year_start: int = DEFAULT_YEAR_START,
    year_end: int = DEFAULT_YEAR_END
) -> List[Dict[str, Any]]:
    """
    Fetch all data for a specific indicator across a list of country codes.
    World Bank API supports multi-country query by semicolon-separated ISO3 codes.
    Handles multi-page pagination.
    """
    countries_param = ";".join(country_codes)
    date_param = f"{year_start}:{year_end}"
    page = 1
    per_page = 1000
    all_records: List[Dict[str, Any]] = []

    while True:
        url = f"{API_BASE_URL}/country/{countries_param}/indicator/{indicator_code}"
        params = {
            "date": date_param,
            "format": "json",
            "page": page,
            "per_page": per_page
        }

        try:
            response = session.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
            if response.status_code != 200:
                logger.error(
                    f"Failed to fetch {indicator_code}: HTTP {response.status_code} - {response.text[:200]}"
                )
                break

            data = response.json()
            if not isinstance(data, list) or len(data) < 2:
                if isinstance(data, list) and len(data) == 1 and "message" in data[0]:
                    logger.warning(f"World Bank API message for {indicator_code}: {data[0]['message']}")
                else:
                    logger.warning(f"Unexpected response structure for {indicator_code}: {data}")
                break

            pagination_meta = data[0]
            records = data[1]

            if not records:
                break

            all_records.extend(records)

            total_pages = pagination_meta.get("pages", 1)
            if page >= total_pages:
                break
            page += 1
            time.sleep(0.05)

        except requests.exceptions.RequestException as e:
            logger.error(f"Network error fetching indicator {indicator_code} on page {page}: {e}")
            break
        except Exception as e:
            logger.error(f"Unexpected error processing {indicator_code}: {e}")
            break

    return all_records

def _fetch_worker(args: Tuple[str, str, str, List[str], int, int]) -> Tuple[str, str, List[Dict[str, Any]]]:
    ind_id, ind_code, ind_name, country_codes, year_start, year_end = args
    session = get_http_session()
    try:
        records = fetch_indicator_for_countries(
            session=session,
            indicator_code=ind_code,
            country_codes=country_codes,
            year_start=year_start,
            year_end=year_end
        )
        return (ind_id, ind_code, records)
    finally:
        session.close()

def fetch_all_indicators(
    year_start: int = DEFAULT_YEAR_START,
    year_end: int = DEFAULT_YEAR_END,
    max_workers: int = 5
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Fetch all configured indicators across all configured countries using a concurrent worker pool.
    Returns a dict mapping indicator_id to list of raw records.
    """
    country_iso3_list = [c["iso3"] for c in COUNTRIES]
    raw_data: Dict[str, List[Dict[str, Any]]] = {}
    total_indicators = len(INDICATORS)

    logger.info(
        f"Starting concurrent fetch ({max_workers} workers) for {total_indicators} indicators across {len(country_iso3_list)} countries."
    )

    tasks = [
        (
            ind["id"],
            ind["code"],
            ind["name"],
            country_iso3_list,
            year_start,
            year_end
        )
        for ind in INDICATORS
    ]

    completed_count = 0
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(_fetch_worker, task): task for task in tasks}
        for future in as_completed(futures):
            ind_id, ind_code, records = future.result()
            raw_data[ind_id] = records
            completed_count += 1
            logger.info(
                f"[{completed_count}/{total_indicators}] Fetched {len(records)} records for {ind_code} ({ind_id})"
            )

    return raw_data
