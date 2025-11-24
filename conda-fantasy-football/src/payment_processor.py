"""Payment data processing."""

import pandas as pd
from datetime import datetime
from typing import Dict, List
from .data_fetcher import fetch_csv, parse_number
from .config import CSV_URLS, MATCH_COLUMNS, BANK_COLUMNS, SEASON_CONFIG


def normalize_player_name(name: str) -> str:
    """Normalize player names for matching across different data sources."""
    if not name or pd.isna(name):
        return ""
    return str(name).lower().strip()


def get_player_payments() -> pd.DataFrame:
    """
    Fetch and process player payment information.
    Combines data from player data, match fees, and bank statement.

    Returns:
        DataFrame with player payment details sorted by balance (highest debt first)
    """
    # Fetch all data sources
    player_data = fetch_csv(CSV_URLS["PLAYER_DATA"])
    match_data = fetch_csv(CSV_URLS["MATCH_DETAILS"])
    bank_data = fetch_csv(CSV_URLS["BANK_STATEMENT"], skip_rows=0)  # No headers
    fines_data = fetch_csv(CSV_URLS["FINES"], skip_rows=0)  # No headers

    player_map: Dict[str, Dict] = {}

    # Process player data (has Fees, Payments, Due columns)
    for _, row in player_data.iterrows():
        player_name = str(row.get("Player", "")).strip()
        fees = parse_number(row.get("Fees", 0))
        payments = parse_number(row.get("Payments", 0))
        due = parse_number(row.get("Due", 0))
        appearance = int(parse_number(row.get("Appearance", 0)))

        if not player_name:
            continue

        normalized = normalize_player_name(player_name)
        player_map[normalized] = {
            "name": player_name,
            "match_fees": fees,
            "season_fees": 0,  # Will be calculated later
            "fines": 0,  # Will be calculated from fines CSV
            "total_owed": fees,
            "paid": payments,
            "balance": due,
            "match_count": appearance,
            "match_details": [],
            "payment_details": [],
            "fine_details": [],
        }

    # Process match details to get match fees per game (skip first 3 rows)
    match_rows = match_data.iloc[3:]
    for _, row in match_rows.iterrows():
        player_name = str(row.get(MATCH_COLUMNS["PLAYER"], "")).strip()
        fee = parse_number(row.get(MATCH_COLUMNS["FEE"], 0))
        date = str(row.get(MATCH_COLUMNS["DATE"], "")).strip()
        game = str(row.get(MATCH_COLUMNS["GAME"], "")).strip()

        if not player_name or not date:
            continue

        normalized = normalize_player_name(player_name)
        player = player_map.get(normalized)

        if player and fee > 0:
            player["match_details"].append({"date": date, "fee": fee, "game": game})

    # Process bank payments
    # Bank statement CSV has no headers, we need to skip the first row if it's a header
    # Let's check if first row looks like a header
    if not bank_data.empty:
        first_row = bank_data.iloc[0]
        # If first column contains "Date" or similar, skip it
        if str(first_row.iloc[0]).strip().lower() in ["date", "Date"]:
            bank_data = bank_data.iloc[1:]

    for _, row in bank_data.iterrows():
        # Access by position using column indices
        try:
            date = str(row.iloc[BANK_COLUMNS["DATE"]]).strip() if len(row) > BANK_COLUMNS["DATE"] else ""
            description = str(row.iloc[BANK_COLUMNS["DESCRIPTION"]]).strip() if len(row) > BANK_COLUMNS["DESCRIPTION"] else ""
            payment = parse_number(row.iloc[BANK_COLUMNS["CREDIT"]] if len(row) > BANK_COLUMNS["CREDIT"] else 0)
            player_name_from_bank = str(row.iloc[BANK_COLUMNS["PLAYER"]]).strip() if len(row) > BANK_COLUMNS["PLAYER"] else ""

            # Skip if no player name or payment
            if not player_name_from_bank or payment == 0 or not date:
                continue

            # Parse date and filter for dates from payment start date onwards
            date_parts = date.split("/")
            if len(date_parts) != 3:
                continue

            day, month, year = map(int, date_parts)
            row_date = datetime(year, month, day)

            # Only process dates from the configured payment start date onwards
            if row_date < SEASON_CONFIG["PAYMENT_START_DATE"]:
                continue

            # Match player
            normalized = normalize_player_name(player_name_from_bank)
            player = player_map.get(normalized)

            if player:
                player["payment_details"].append(
                    {"date": date, "amount": payment, "description": description}
                )
        except (IndexError, ValueError):
            continue

    # Process fines data (skip first 4 rows)
    if not fines_data.empty:
        fines_rows = fines_data.iloc[4:]
        for _, row in fines_rows.iterrows():
            try:
                # Column indices: 0 is empty, 1 is Date, 2 is Fines, 3 is Description, 4 is Player
                player_name = str(row.iloc[4]).strip() if len(row) > 4 else ""
                fine = parse_number(row.iloc[2] if len(row) > 2 else 0)
                date = str(row.iloc[1]).strip() if len(row) > 1 else ""
                description = str(row.iloc[3]).strip() if len(row) > 3 else ""

                if not player_name or not date or fine <= 0:
                    continue

                normalized = normalize_player_name(player_name)
                player = player_map.get(normalized)

                if player:
                    player["fines"] += fine
                    player["fine_details"].append(
                        {"date": date, "amount": fine, "description": description}
                    )
            except (IndexError, ValueError):
                continue

    # Calculate season fees and update totals
    for player in player_map.values():
        # Apply season fee if player has played more than threshold number of games
        player["season_fees"] = (
            SEASON_CONFIG["SEASON_FEE"]
            if player["match_count"] > SEASON_CONFIG["SEASON_FEE_THRESHOLD"]
            else 0
        )

        # Update totalOwed to include season fees
        player["total_owed"] = player["match_fees"] + player["season_fees"]

        # Recalculate balance as Total Owed - Total Paid
        player["balance"] = player["total_owed"] - player["paid"]

        # Sort details by date
        for detail_key in ["match_details", "payment_details", "fine_details"]:
            player[detail_key].sort(key=lambda x: parse_date_for_sorting(x["date"]))

    # Convert to DataFrame
    players_list = [
        p
        for p in player_map.values()
        if p["match_count"] > 0 or p["fines"] > 0
    ]

    if not players_list:
        return pd.DataFrame()

    df = pd.DataFrame(players_list)

    # Sort by balance (highest debt first)
    df = df.sort_values("balance", ascending=False).reset_index(drop=True)

    return df


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
