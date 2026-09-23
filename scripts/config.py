"""
Configuration registry for Global Development Pulse.
Centralizes country and indicator definitions, API settings, and formatting rules.
Ensures zero hardcoded country/indicator logic throughout the pipeline and application.
"""

from pathlib import Path
from typing import Dict, List, Any

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "processed"
COUNTRIES_DIR = DATA_DIR / "countries"
INDICATORS_DIR = DATA_DIR / "indicators"
METADATA_DIR = BASE_DIR / "data" / "metadata"

API_BASE_URL = "https://api.worldbank.org/v2"
DEFAULT_YEAR_START = 2000
DEFAULT_YEAR_END = 2024
REQUEST_TIMEOUT_SECONDS = 25
MAX_RETRIES = 3
BACKOFF_FACTOR = 1.5

COUNTRIES: List[Dict[str, Any]] = [
    {
        "id": "pakistan",
        "iso3": "PAK",
        "iso2": "PK",
        "name": "Pakistan",
        "region": "South Asia",
        "income_group": "Lower middle income",
        "capital": "Islamabad",
        "flag_emoji": "🇵🇰"
    },
    {
        "id": "india",
        "iso3": "IND",
        "iso2": "IN",
        "name": "India",
        "region": "South Asia",
        "income_group": "Lower middle income",
        "capital": "New Delhi",
        "flag_emoji": "🇮🇳"
    },
    {
        "id": "bangladesh",
        "iso3": "BGD",
        "iso2": "BD",
        "name": "Bangladesh",
        "region": "South Asia",
        "income_group": "Lower middle income",
        "capital": "Dhaka",
        "flag_emoji": "🇧🇩"
    },
    {
        "id": "sri-lanka",
        "iso3": "LKA",
        "iso2": "LK",
        "name": "Sri Lanka",
        "region": "South Asia",
        "income_group": "Lower middle income",
        "capital": "Colombo",
        "flag_emoji": "🇱🇰"
    },
    {
        "id": "nepal",
        "iso3": "NPL",
        "iso2": "NP",
        "name": "Nepal",
        "region": "South Asia",
        "income_group": "Lower middle income",
        "capital": "Kathmandu",
        "flag_emoji": "🇳🇵"
    },
    {
        "id": "united-arab-emirates",
        "iso3": "ARE",
        "iso2": "AE",
        "name": "United Arab Emirates",
        "region": "Middle East & North Africa",
        "income_group": "High income",
        "capital": "Abu Dhabi",
        "flag_emoji": "🇦🇪"
    },
    {
        "id": "saudi-arabia",
        "iso3": "SAU",
        "iso2": "SA",
        "name": "Saudi Arabia",
        "region": "Middle East & North Africa",
        "income_group": "High income",
        "capital": "Riyadh",
        "flag_emoji": "🇸🇦"
    },
    {
        "id": "united-kingdom",
        "iso3": "GBR",
        "iso2": "GB",
        "name": "United Kingdom",
        "region": "Europe & Central Asia",
        "income_group": "High income",
        "capital": "London",
        "flag_emoji": "🇬🇧"
    },
    {
        "id": "united-states",
        "iso3": "USA",
        "iso2": "US",
        "name": "United States",
        "region": "North America",
        "income_group": "High income",
        "capital": "Washington, D.C.",
        "flag_emoji": "🇺🇸"
    },
    {
        "id": "canada",
        "iso3": "CAN",
        "iso2": "CA",
        "name": "Canada",
        "region": "North America",
        "income_group": "High income",
        "capital": "Ottawa",
        "flag_emoji": "🇨🇦"
    },
    {
        "id": "germany",
        "iso3": "DEU",
        "iso2": "DE",
        "name": "Germany",
        "region": "Europe & Central Asia",
        "income_group": "High income",
        "capital": "Berlin",
        "flag_emoji": "🇩🇪"
    },
    {
        "id": "france",
        "iso3": "FRA",
        "iso2": "FR",
        "name": "France",
        "region": "Europe & Central Asia",
        "income_group": "High income",
        "capital": "Paris",
        "flag_emoji": "🇫🇷"
    },
    {
        "id": "japan",
        "iso3": "JPN",
        "iso2": "JP",
        "name": "Japan",
        "region": "East Asia & Pacific",
        "income_group": "High income",
        "capital": "Tokyo",
        "flag_emoji": "🇯🇵"
    },
    {
        "id": "australia",
        "iso3": "AUS",
        "iso2": "AU",
        "name": "Australia",
        "region": "East Asia & Pacific",
        "income_group": "High income",
        "capital": "Canberra",
        "flag_emoji": "🇦🇺"
    },
    {
        "id": "china",
        "iso3": "CHN",
        "iso2": "CN",
        "name": "China",
        "region": "East Asia & Pacific",
        "income_group": "Upper middle income",
        "capital": "Beijing",
        "flag_emoji": "🇨🇳"
    }
]

INDICATORS: List[Dict[str, Any]] = [
    # --- Economic Indicators ---
    {
        "id": "gdp_current_usd",
        "code": "NY.GDP.MKTP.CD",
        "name": "GDP (Current US$)",
        "short_description": "Gross domestic product at purchaser's prices in current US dollars.",
        "category": "Economic",
        "unit": "current US$",
        "source": "World Bank national accounts data, and OECD National Accounts data files.",
        "format": "currency",
        "chart_type": "area",
        "descriptive_only": True
    },
    {
        "id": "gdp_per_capita_usd",
        "code": "NY.GDP.PCAP.CD",
        "name": "GDP per Capita (Current US$)",
        "short_description": "Gross domestic product divided by midyear population in current US dollars.",
        "category": "Economic",
        "unit": "current US$",
        "source": "World Bank national accounts data, and OECD National Accounts data files.",
        "format": "currency",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "gdp_growth_annual",
        "code": "NY.GDP.MKTP.KD.ZG",
        "name": "GDP Growth (Annual %)",
        "short_description": "Annual percentage growth rate of GDP at market prices based on constant local currency.",
        "category": "Economic",
        "unit": "%",
        "source": "World Bank national accounts data, and OECD National Accounts data files.",
        "format": "percentage",
        "chart_type": "bar",
        "descriptive_only": True
    },
    {
        "id": "inflation_consumer_prices",
        "code": "FP.CPI.TOTL.ZG",
        "name": "Inflation, Consumer Prices (Annual %)",
        "short_description": "Annual percentage change in the cost to the average consumer of acquiring a basket of goods and services.",
        "category": "Economic",
        "unit": "%",
        "source": "International Monetary Fund, International Financial Statistics and data files.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "exports_percent_gdp",
        "code": "NE.EXP.GNFS.ZS",
        "name": "Exports of Goods and Services (% of GDP)",
        "short_description": "Value of all goods and other market services provided to the rest of the world as % of GDP.",
        "category": "Economic",
        "unit": "% of GDP",
        "source": "World Bank national accounts data, and OECD National Accounts data files.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "imports_percent_gdp",
        "code": "NE.IMP.GNFS.ZS",
        "name": "Imports of Goods and Services (% of GDP)",
        "short_description": "Value of all goods and other market services received from the rest of the world as % of GDP.",
        "category": "Economic",
        "unit": "% of GDP",
        "source": "World Bank national accounts data, and OECD National Accounts data files.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "fdi_net_inflows_percent_gdp",
        "code": "BX.KLT.DINV.WD.GD.ZS",
        "name": "Foreign Direct Investment, Net Inflows (% of GDP)",
        "short_description": "Net inflows of investment to acquire a lasting management interest in an enterprise.",
        "category": "Economic",
        "unit": "% of GDP",
        "source": "International Monetary Fund, Balance of Payments database.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },

    # --- Population Indicators ---
    {
        "id": "population_total",
        "code": "SP.POP.TOTL",
        "name": "Total Population",
        "short_description": "Total population counts all residents regardless of legal status or citizenship.",
        "category": "Population",
        "unit": "people",
        "source": "United Nations Population Division. World Population Prospects.",
        "format": "number",
        "chart_type": "area",
        "descriptive_only": True
    },
    {
        "id": "population_growth_annual",
        "code": "SP.POP.GROW",
        "name": "Population Growth (Annual %)",
        "short_description": "Exponential annual rate of population growth from midyear t-1 to midyear t.",
        "category": "Population",
        "unit": "%",
        "source": "United Nations Population Division. World Population Prospects.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "urban_population_percent",
        "code": "SP.URB.TOTL.IN.ZS",
        "name": "Urban Population (% of Total)",
        "short_description": "Urban population refers to people living in urban areas as defined by national statistical offices.",
        "category": "Population",
        "unit": "%",
        "source": "United Nations Population Division. World Urbanization Prospects.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "life_expectancy_birth",
        "code": "SP.DYN.LE00.IN",
        "name": "Life Expectancy at Birth (Years)",
        "short_description": "Number of years a newborn infant would live if prevailing patterns of mortality were to stay the same.",
        "category": "Population",
        "unit": "years",
        "source": "United Nations Population Division and World Bank Group.",
        "format": "decimal",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "birth_rate_crude",
        "code": "SP.DYN.CBRT.IN",
        "name": "Birth Rate, Crude (per 1,000 People)",
        "short_description": "Crude birth rate indicates the number of live births occurring during the year per 1,000 midyear population.",
        "category": "Population",
        "unit": "per 1,000 people",
        "source": "United Nations Population Division. World Population Prospects.",
        "format": "decimal",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "death_rate_crude",
        "code": "SP.DYN.CDRT.IN",
        "name": "Death Rate, Crude (per 1,000 People)",
        "short_description": "Crude death rate indicates the number of deaths occurring during the year per 1,000 midyear population.",
        "category": "Population",
        "unit": "per 1,000 people",
        "source": "United Nations Population Division. World Population Prospects.",
        "format": "decimal",
        "chart_type": "line",
        "descriptive_only": True
    },

    # --- Employment Indicators ---
    {
        "id": "unemployment_rate",
        "code": "SL.UEM.TOTL.ZS",
        "name": "Unemployment Rate (% of Labor Force)",
        "short_description": "Share of the labor force that is without work but available for and seeking employment.",
        "category": "Employment",
        "unit": "%",
        "source": "International Labour Organization, ILOSTAT database.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "labor_force_participation",
        "code": "SL.TLF.CACT.ZS",
        "name": "Labor Force Participation Rate (% of Ages 15+)",
        "short_description": "Proportion of the population ages 15 and older that engages actively in the labor market.",
        "category": "Employment",
        "unit": "%",
        "source": "International Labour Organization, ILOSTAT database.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "employment_to_population_ratio",
        "code": "SL.EMP.TOTL.SP.ZS",
        "name": "Employment to Population Ratio (% Ages 15+)",
        "short_description": "Proportion of a country's population aged 15 and older that is employed.",
        "category": "Employment",
        "unit": "%",
        "source": "International Labour Organization, ILOSTAT database.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },

    # --- Education Indicators ---
    {
        "id": "school_enrollment_primary",
        "code": "SE.PRM.ENRR",
        "name": "School Enrollment, Primary (% Gross)",
        "short_description": "Total enrollment in primary education, regardless of age, expressed as percentage of the official primary education age population.",
        "category": "Education",
        "unit": "% gross",
        "source": "UNESCO Institute for Statistics.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "school_enrollment_secondary",
        "code": "SE.SEC.ENRR",
        "name": "School Enrollment, Secondary (% Gross)",
        "short_description": "Total enrollment in secondary education, regardless of age, expressed as percentage of the official secondary education age population.",
        "category": "Education",
        "unit": "% gross",
        "source": "UNESCO Institute for Statistics.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "education_expenditure_gdp",
        "code": "SE.XPD.TOTL.GD.ZS",
        "name": "Government Expenditure on Education (% of GDP)",
        "short_description": "General government expenditure on education (current, capital, and transfers) expressed as percentage of GDP.",
        "category": "Education",
        "unit": "% of GDP",
        "source": "UNESCO Institute for Statistics.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "literacy_rate_adult",
        "code": "SE.ADT.LITR.ZS",
        "name": "Adult Literacy Rate (% Ages 15+)",
        "short_description": "Percentage of people aged 15 and above who can both read and write with understanding a short simple statement.",
        "category": "Education",
        "unit": "%",
        "source": "UNESCO Institute for Statistics.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },

    # --- Digital & Connectivity Indicators ---
    {
        "id": "internet_users_percent",
        "code": "IT.NET.USER.ZS",
        "name": "Individuals Using the Internet (% of Population)",
        "short_description": "Percentage of individuals who used the Internet from any location in the last 3 months via any device.",
        "category": "Digital",
        "unit": "%",
        "source": "International Telecommunication Union (ITU) World Telecommunication/ICT Indicators.",
        "format": "percentage",
        "chart_type": "area",
        "descriptive_only": True
    },
    {
        "id": "mobile_subscriptions_per_100",
        "code": "IT.CEL.SETS.P2",
        "name": "Mobile Cellular Subscriptions (per 100 People)",
        "short_description": "Subscriptions to a public mobile telephone service providing access to the PSTN using cellular technology.",
        "category": "Digital",
        "unit": "per 100 people",
        "source": "International Telecommunication Union (ITU).",
        "format": "decimal",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "secure_internet_servers_per_million",
        "code": "IT.NET.SECR.P6",
        "name": "Secure Internet Servers (per Million People)",
        "short_description": "Number of publicly accessible secure Internet servers using SSL/TLS encryption per million people.",
        "category": "Digital",
        "unit": "per 1M people",
        "source": "Netcraft and World Bank population estimates.",
        "format": "number",
        "chart_type": "line",
        "descriptive_only": True
    },

    # --- Environment & Energy Indicators ---
    {
        "id": "forest_area_percent",
        "code": "AG.LND.FRST.ZS",
        "name": "Forest Area (% of Land Area)",
        "short_description": "Land spanning more than 0.5 hectares with trees higher than 5 meters and a canopy cover of more than 10 percent.",
        "category": "Environment",
        "unit": "%",
        "source": "Food and Agriculture Organization (FAO) Global Forest Resources Assessment.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "renewable_electricity_output",
        "code": "EG.ELC.RNEW.ZS",
        "name": "Renewable Electricity Output (% of Total Electricity)",
        "short_description": "Share of electricity generated by renewable power plants including hydropower, solar, wind, and bioenergy.",
        "category": "Environment",
        "unit": "%",
        "source": "IEA World Energy Statistics and Balances.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "renewable_energy_consumption_percent",
        "code": "EG.FEC.RNEW.ZS",
        "name": "Renewable Energy Consumption (% of Total Final Energy)",
        "short_description": "Share of renewable energy in total final energy consumption.",
        "category": "Environment",
        "unit": "%",
        "source": "World Bank, Sustainable Energy for All (SE4ALL) database.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "energy_use_per_capita",
        "code": "EG.USE.PCAP.KG.OE",
        "name": "Energy Use (kg of Oil Equivalent per Capita)",
        "short_description": "Use of primary energy before transformation to other end-use fuels.",
        "category": "Environment",
        "unit": "kgoe",
        "source": "International Energy Agency (IEA).",
        "format": "number",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "electricity_access_percent",
        "code": "EG.ELC.ACCS.ZS",
        "name": "Access to Electricity (% of Population)",
        "short_description": "Percentage of people in a country with access to electricity from grid or off-grid sources.",
        "category": "Environment",
        "unit": "%",
        "source": "World Bank, Sustainable Energy for All (SE4ALL) database.",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "electric_power_consumption_per_capita",
        "code": "EG.USE.ELEC.KH.PC",
        "name": "Electric Power Consumption (kWh per Capita)",
        "short_description": "Electric power consumption measures the production of power plants and combined heat and power plants less transmission, distribution, and transformation losses.",
        "category": "Environment",
        "unit": "kWh per capita",
        "source": "International Energy Agency (IEA).",
        "format": "number",
        "chart_type": "line",
        "descriptive_only": True
    },
    {
        "id": "agricultural_land_percent",
        "code": "AG.LND.AGRI.ZS",
        "name": "Agricultural Land (% of Land Area)",
        "short_description": "Share of land area that is arable, under permanent crops, and under permanent pastures.",
        "category": "Environment",
        "unit": "%",
        "source": "Food and Agriculture Organization (FAO).",
        "format": "percentage",
        "chart_type": "line",
        "descriptive_only": True
    }
]

# Lookup helper mappings
COUNTRY_BY_ISO3: Dict[str, Dict[str, Any]] = {c["iso3"]: c for c in COUNTRIES}
COUNTRY_BY_ID: Dict[str, Dict[str, Any]] = {c["id"]: c for c in COUNTRIES}
INDICATOR_BY_CODE: Dict[str, Dict[str, Any]] = {i["code"]: i for i in INDICATORS}
INDICATOR_BY_ID: Dict[str, Dict[str, Any]] = {i["id"]: i for i in INDICATORS}
CATEGORIES: List[str] = sorted(list(set(i["category"] for i in INDICATORS)))
