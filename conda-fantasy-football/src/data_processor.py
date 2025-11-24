"""Data processing utilities for player statistics."""

import pandas as pd
from typing import Dict, List
from .data_fetcher import fetch_csv, parse_number, clean_player_name
from .config import CSV_URLS, MATCH_COLUMNS


def get_player_stats() -> pd.DataFrame:
    """
    Fetch and aggregate player statistics from match data and player data.
    Includes Misc-Points from Player Data CSV for manual adjustments.

    Returns:
        DataFrame with player statistics sorted by fantasy points (highest first)
    """
    # Fetch both match data and player data
    # Match data uses generic column names like '_1', '_2' to match TypeScript behavior
    match_data = fetch_csv(CSV_URLS["MATCH_DETAILS"], use_generic_headers=True)
    player_data = fetch_csv(CSV_URLS["PLAYER_DATA"])

    # Skip first 3 rows (headers and empty rows) for match data
    data_rows = match_data.iloc[3:].copy()

    # Initialize dictionary to store player stats
    player_stats: Dict[str, Dict] = {}

    # Process each match row
    for _, row in data_rows.iterrows():
        player_name = clean_player_name(row.get(MATCH_COLUMNS["PLAYER"], ""))

        if not player_name:
            continue  # Skip rows without player name

        # Get or create player stat entry
        if player_name not in player_stats:
            player_stats[player_name] = {
                "name": player_name,
                "appearances": 0,
                "goals": 0,
                "assists": 0,
                "clean_sheets": 0,
                "yellow_cards": 0,
                "red_cards": 0,
                "mom1": 0,
                "mom2": 0,
                "mom3": 0,
                "dod": 0,
                "fantasy_points": 0.0,
            }

        # Parse match stats using column constants
        appearance = parse_number(row.get(MATCH_COLUMNS["APPEARANCE"], 0))
        goals = parse_number(row.get(MATCH_COLUMNS["GOALS"], 0))
        assists = parse_number(row.get(MATCH_COLUMNS["ASSISTS"], 0))
        yellow_card = parse_number(row.get(MATCH_COLUMNS["YELLOW_CARD"], 0))
        red_card = parse_number(row.get(MATCH_COLUMNS["RED_CARD"], 0))
        clean_sheet = parse_number(row.get(MATCH_COLUMNS["CLEAN_SHEET"], 0))
        mom = parse_number(row.get(MATCH_COLUMNS["MOM"], 0))
        mom2 = parse_number(row.get(MATCH_COLUMNS["MOM_2"], 0))
        mom3 = parse_number(row.get(MATCH_COLUMNS["MOM_3"], 0))
        dod = parse_number(row.get(MATCH_COLUMNS["DOD"], 0))
        total_points = parse_number(row.get(MATCH_COLUMNS["TOTAL_POINTS"], 0))

        # Aggregate stats
        if appearance > 0:
            player_stats[player_name]["appearances"] += int(appearance)

        player_stats[player_name]["goals"] += int(goals)
        player_stats[player_name]["assists"] += int(assists)

        if clean_sheet > 0:
            player_stats[player_name]["clean_sheets"] += int(clean_sheet)

        if yellow_card > 0:
            player_stats[player_name]["yellow_cards"] += int(yellow_card)

        if red_card > 0:
            player_stats[player_name]["red_cards"] += int(red_card)

        if mom > 0:
            player_stats[player_name]["mom1"] += int(mom)

        if mom2 > 0:
            player_stats[player_name]["mom2"] += int(mom2)

        if mom3 > 0:
            player_stats[player_name]["mom3"] += int(mom3)

        if dod > 0:
            player_stats[player_name]["dod"] += int(dod)

        player_stats[player_name]["fantasy_points"] += total_points

    # Add Misc-Points from Player Data CSV
    # This allows manual adjustments to be reflected in fantasy points
    for _, row in player_data.iterrows():
        player_name = clean_player_name(row.get("Player", ""))
        if not player_name:
            continue

        if player_name in player_stats:
            misc_points = parse_number(row.get("Misc-Points", 0))
            player_stats[player_name]["fantasy_points"] += misc_points

    # Convert to DataFrame
    df = pd.DataFrame.from_dict(player_stats, orient="index")

    # Check if DataFrame is empty
    if df.empty:
        return df

    # Sort by fantasy points (descending)
    df = df.sort_values("fantasy_points", ascending=False).reset_index(drop=True)

    return df


def get_medal_emoji(rank: int) -> str:
    """
    Get medal emoji for top 3 ranks.

    Args:
        rank: Player rank (0-indexed)

    Returns:
        Medal emoji or rank number
    """
    if rank == 0:
        return "🥇"
    elif rank == 1:
        return "🥈"
    elif rank == 2:
        return "🥉"
    else:
        return str(rank + 1)
