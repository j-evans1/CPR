"""Fines data processing."""

import pandas as pd
from typing import Dict
from .data_fetcher import fetch_csv, parse_number
from .config import CSV_URLS


def normalize_player_name(name: str) -> str:
    """Normalize player names for matching across different data sources."""
    if not name or pd.isna(name):
        return ""
    return str(name).lower().strip()


def get_player_fines() -> pd.DataFrame:
    """
    Fetch and process player fines information.

    Returns:
        DataFrame with player fine details sorted by total fines (highest first)
    """
    fines_data = fetch_csv(CSV_URLS["FINES"], skip_rows=0)

    player_map: Dict[str, Dict] = {}

    # Process fines data
    # Skip first 4 rows: 2 header rows + 1 empty row + 1 column header row
    # Check if first row is a header
    if not fines_data.empty:
        fines_rows = fines_data.iloc[4:]

        for _, row in fines_rows.iterrows():
            try:
                # Column indices: 0 is empty, 1 is Date, 2 is Fines, 3 is Description, 4 is Player
                player_name = str(row.iloc[4]).strip() if len(row) > 4 else ""
                fine = parse_number(row.iloc[2] if len(row) > 2 else 0)
                date = str(row.iloc[1]).strip() if len(row) > 1 else ""
                description = str(row.iloc[3]).strip() if len(row) > 3 else ""

                if not player_name or not date:
                    continue
                if fine <= 0:
                    continue  # Skip rows with no fine amount

                normalized = normalize_player_name(player_name)

                if normalized not in player_map:
                    player_map[normalized] = {
                        "name": player_name,
                        "total_fines": 0.0,
                        "fine_count": 0,
                        "fine_details": [],
                    }

                player = player_map[normalized]
                player["total_fines"] += fine
                player["fine_count"] += 1
                player["fine_details"].append(
                    {"date": date, "amount": fine, "description": description}
                )
            except (IndexError, ValueError):
                continue

    # Sort fine details by date for each player
    def parse_date_for_sorting(date_str: str) -> tuple:
        """Parse DD/MM/YYYY format for sorting."""
        try:
            parts = date_str.split("/")
            if len(parts) == 3:
                day, month, year = map(int, parts)
                return (year, month, day)
        except:
            pass
        return (0, 0, 0)

    for player in player_map.values():
        player["fine_details"].sort(key=lambda x: parse_date_for_sorting(x["date"]))

    # Convert to DataFrame
    if not player_map:
        return pd.DataFrame()

    df = pd.DataFrame.from_dict(player_map, orient="index")

    # Sort by total fines (highest first)
    df = df.sort_values("total_fines", ascending=False).reset_index(drop=True)

    return df


def calculate_filtered_fines(fine_details: list, max_amount: float = 5.0) -> dict:
    """
    Calculate filtered fines (≤ max_amount only).

    Args:
        fine_details: List of fine detail dictionaries
        max_amount: Maximum fine amount to include (default: 5.0)

    Returns:
        Dictionary with total, count, and average of filtered fines
    """
    filtered = [f for f in fine_details if f["amount"] <= max_amount]
    total = sum(f["amount"] for f in filtered)
    count = len(filtered)
    avg = total / count if count > 0 else 0.0

    return {"total": total, "count": count, "average": avg, "filtered_details": filtered}
