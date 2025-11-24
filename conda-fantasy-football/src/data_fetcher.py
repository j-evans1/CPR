"""Data fetching utilities for CPR Fantasy Football."""

import pandas as pd
import streamlit as st
from datetime import datetime, timedelta
from typing import Optional
import re


@st.cache_data(ttl=60)  # Cache for 60 seconds
def fetch_csv(url: str, skip_rows: int = 0) -> pd.DataFrame:
    """
    Fetch and parse CSV data from a URL with caching.

    Args:
        url: The URL of the CSV file to fetch
        skip_rows: Number of rows to skip at the beginning (default: 0)

    Returns:
        DataFrame containing the parsed CSV data
    """
    try:
        df = pd.read_csv(url, skiprows=skip_rows)
        return df
    except Exception as e:
        st.error(f"Error fetching CSV from {url}: {str(e)}")
        raise


def normalize_string(value: Optional[str]) -> str:
    """
    Clean and normalize strings for comparison.

    Args:
        value: String to normalize

    Returns:
        Trimmed lowercase string
    """
    if value is None or pd.isna(value):
        return ""
    return str(value).strip().lower()


def parse_number(value) -> float:
    """
    Parse numeric values from various formats.
    Handles currency symbols (£, $) and comma separators.

    Args:
        value: Value to parse (string or number)

    Returns:
        Parsed number, or 0.0 if parsing fails
    """
    if pd.isna(value):
        return 0.0

    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, str):
        # Remove currency symbols and commas
        cleaned = re.sub(r'[£$,]', '', value)
        try:
            return float(cleaned)
        except ValueError:
            return 0.0

    return 0.0


def clean_player_name(name) -> str:
    """
    Clean and normalize player names.

    Args:
        name: Player name to clean

    Returns:
        Cleaned player name as string
    """
    if pd.isna(name):
        return ""
    return str(name).strip()
