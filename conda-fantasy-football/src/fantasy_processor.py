"""Fantasy league data processing."""

import pandas as pd
from typing import Dict, List
from .data_fetcher import fetch_csv
from .config import CSV_URLS


def get_fantasy_league() -> pd.DataFrame:
    """
    Fetch and process fantasy league team data.

    Returns:
        DataFrame with fantasy teams sorted by total points (highest first)
        Columns: team_name, manager_name, total_points, rank, players (list)
    """
    # Fetch team selection data
    team_data = fetch_csv(CSV_URLS["TEAM_SELECTION"])

    # The CSV structure: each row is a player on a team
    # Columns: Team Name, Manager, Players, Price, Position, Total-Points, Team-Points
    teams_map: Dict[str, Dict] = {}

    for _, row in team_data.iterrows():
        team_name = str(row.get("Team Name", "")).strip()
        manager_name = str(row.get("Manager", "")).strip()
        player_name = str(row.get("Players", "")).strip()
        position = str(row.get("Position", "")).strip()
        price = float(row.get("Price", 0) or 0)
        player_points = float(row.get("Total-Points", 0) or 0)
        team_points = float(row.get("Team-Points", 0) or 0)

        # Skip rows without team name
        if not team_name or not manager_name:
            continue

        # Get or create team
        if team_name not in teams_map:
            teams_map[team_name] = {
                "team_name": team_name,
                "manager_name": manager_name,
                "players": [],
                "total_points": team_points,
                "rank": 0,  # Will be calculated after sorting
            }

        team = teams_map[team_name]

        # Add player if we have player data
        if player_name:
            team["players"].append(
                {
                    "name": player_name,
                    "position": position,
                    "price": price,
                    "points": player_points,
                }
            )

    # Convert to DataFrame
    teams_list = []
    for team_name, team in teams_map.items():
        # Calculate total points from players
        total_points = sum(p["points"] for p in team["players"])
        teams_list.append(
            {
                "team_name": team["team_name"],
                "manager_name": team["manager_name"],
                "total_points": total_points,
                "players": team["players"],
            }
        )

    df = pd.DataFrame(teams_list)

    if df.empty:
        return df

    # Sort by total points (descending)
    df = df.sort_values("total_points", ascending=False).reset_index(drop=True)

    # Assign ranks
    df["rank"] = df.index + 1

    return df


def get_team_players_df(players_list: List[Dict]) -> pd.DataFrame:
    """
    Convert team players list to DataFrame for display.

    Args:
        players_list: List of player dictionaries

    Returns:
        DataFrame with player details
    """
    if not players_list:
        return pd.DataFrame()

    df = pd.DataFrame(players_list)

    # Sort by points (descending)
    df = df.sort_values("points", ascending=False).reset_index(drop=True)

    return df
