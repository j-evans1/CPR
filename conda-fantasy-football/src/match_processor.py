"""Match data processing."""

import pandas as pd
import re
from typing import Dict, List, Tuple
from .data_fetcher import fetch_csv, parse_number
from .config import CSV_URLS, MATCH_COLUMNS


def parse_score(match_description: str) -> Tuple[str, int, int, str]:
    """
    Parse score from match description (e.g., "CPR 3v2 Opponent" or "CPRA 4v4 Opponent").

    Args:
        match_description: Match description string

    Returns:
        Tuple of (team, cpr_score, opponent_score, opponent_name)
    """
    # Try to match CPRA first (more specific), then CPR
    cpra_match = re.search(r"CPRA\s+(\d+)v(\d+)\s+(.+)", match_description, re.IGNORECASE)
    if cpra_match:
        return (
            "CPRA",
            int(cpra_match.group(1)),
            int(cpra_match.group(2)),
            cpra_match.group(3).strip(),
        )

    cpr_match = re.search(r"CPR\s+(\d+)v(\d+)\s+(.+)", match_description, re.IGNORECASE)
    if cpr_match:
        return (
            "CPR",
            int(cpr_match.group(1)),
            int(cpr_match.group(2)),
            cpr_match.group(3).strip(),
        )

    # Default to CPR if can't parse
    return (
        "CPR",
        0,
        0,
        re.sub(r"^CPR(A)?\s+", "", match_description, flags=re.IGNORECASE).strip(),
    )


def get_matches() -> List[Dict]:
    """
    Fetch and process match data with player performances.

    Returns:
        List of match dictionaries sorted by date (most recent first)
    """
    # Match data uses generic column names like '_1', '_2' to match TypeScript behavior
    match_data = fetch_csv(CSV_URLS["MATCH_DETAILS"], use_generic_headers=True)

    # Skip first 3 rows (headers)
    data_rows = match_data.iloc[3:]

    # Group by match (date + game description)
    matches_map: Dict[str, Dict] = {}

    for _, row in data_rows.iterrows():
        date = str(row.get(MATCH_COLUMNS["DATE"], "")).strip()
        gameweek = str(row.get(MATCH_COLUMNS["GAMEWEEK"], "")).strip()
        match_description = str(row.get(MATCH_COLUMNS["GAME"], "")).strip()
        player_name = str(row.get(MATCH_COLUMNS["PLAYER"], "")).strip()

        if not date or not match_description or not player_name:
            continue

        match_key = f"{date}-{match_description}"

        # Create match entry if it doesn't exist
        if match_key not in matches_map:
            team, cpr_score, opp_score, opp_name = parse_score(match_description)
            matches_map[match_key] = {
                "date": date,
                "team": team,
                "opponent": opp_name,
                "score": f"{cpr_score}-{opp_score}",
                "cpr_score": cpr_score,
                "opponent_score": opp_score,
                "gameweek": gameweek,
                "players": [],
            }

        match = matches_map[match_key]

        # Add player performance
        match["players"].append(
            {
                "name": player_name,
                "appearance": parse_number(row.get(MATCH_COLUMNS["APPEARANCE"], 0)),
                "goals": parse_number(row.get(MATCH_COLUMNS["GOALS"], 0)),
                "assists": parse_number(row.get(MATCH_COLUMNS["ASSISTS"], 0)),
                "clean_sheet": parse_number(row.get(MATCH_COLUMNS["CLEAN_SHEET"], 0)),
                "yellow_card": parse_number(row.get(MATCH_COLUMNS["YELLOW_CARD"], 0)),
                "red_card": parse_number(row.get(MATCH_COLUMNS["RED_CARD"], 0)),
                "points": parse_number(row.get(MATCH_COLUMNS["TOTAL_POINTS"], 0)),
            }
        )

    # Convert to list
    matches = list(matches_map.values())

    # Sort by date (most recent first)
    def parse_date(date_str: str):
        """Parse DD/MM/YYYY format"""
        try:
            parts = date_str.split("/")
            if len(parts) == 3:
                day, month, year = map(int, parts)
                return (year, month, day)
        except:
            pass
        return (0, 0, 0)

    matches.sort(key=lambda m: parse_date(m["date"]), reverse=True)

    return matches


def get_match_result_badge(cpr_score: int, opponent_score: int) -> str:
    """
    Get result badge emoji for a match.

    Args:
        cpr_score: CPR score
        opponent_score: Opponent score

    Returns:
        Emoji string representing win/draw/loss
    """
    if cpr_score > opponent_score:
        return "✅"  # Win
    elif cpr_score < opponent_score:
        return "❌"  # Loss
    else:
        return "⚖️"  # Draw
