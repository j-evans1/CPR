"""
CPR Fantasy Football - Main Application
========================================
A fantasy football application for Clissold Park Rangers FC,
tracking player statistics and league management for the 2025/26 season.
"""

import streamlit as st
import pandas as pd
from src.data_processor import get_player_stats, get_medal_emoji


# Page configuration
st.set_page_config(
    page_title="CPR Fantasy Football",
    page_icon="⚽",
    layout="wide",
    initial_sidebar_state="expanded",
)


def style_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply styling to the player stats dataframe.

    Args:
        df: DataFrame with player stats

    Returns:
        Styled DataFrame
    """
    # Add rank column with medals
    df_display = df.copy()
    df_display.insert(0, "Rank", [get_medal_emoji(i) for i in range(len(df))])

    # Rename columns for display
    column_mapping = {
        "name": "Player",
        "appearances": "Apps",
        "goals": "Goals",
        "assists": "Assists",
        "clean_sheets": "Clean Sheets",
        "mom1": "MoM 1",
        "mom2": "MoM 2",
        "mom3": "MoM 3",
        "dod": "DoD",
        "yellow_cards": "Yellow Cards",
        "red_cards": "Red Cards",
        "fantasy_points": "Fantasy Points",
    }
    df_display = df_display.rename(columns=column_mapping)

    return df_display


def main():
    """Main application entry point."""

    # Header
    st.markdown("# ⚽ CPR FANTASY FOOTBALL")
    st.markdown("### Player Stats Leaderboard - Season 2025/26")
    st.markdown("---")

    # Sidebar info
    with st.sidebar:
        st.markdown("## ⚽ CPR Fantasy Football")
        st.markdown(
            """
            **Clissold Park Rangers FC**

            Fantasy football application for the 2025/26 season.
            """
        )
        st.markdown("---")
        st.markdown("### 📊 Pages")
        st.page_link("app.py", label="📈 Player Stats", icon="📈")
        st.page_link("pages/1_🏆_Fantasy_League.py", label="Fantasy League", icon="🏆")
        st.page_link("pages/2_⚽_Match_Results.py", label="Match Results", icon="⚽")
        st.page_link("pages/3_💰_Payments.py", label="Payments", icon="💰")
        st.page_link("pages/4_🚫_Fines.py", label="Fines", icon="🚫")
        st.markdown("---")
        st.caption("Data updates automatically from Google Sheets")
        st.caption("**Up The Park! ⚽**")

    # Load data
    try:
        with st.spinner("Loading player statistics..."):
            player_stats_df = get_player_stats()

        if player_stats_df.empty:
            st.warning("No player stats available yet.")
            return

        # Display stats
        st.markdown("## 📈 Player Statistics")

        # Summary metrics in columns
        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.metric("Total Players", len(player_stats_df))

        with col2:
            total_goals = int(player_stats_df["goals"].sum())
            st.metric("Total Goals", total_goals)

        with col3:
            total_assists = int(player_stats_df["assists"].sum())
            st.metric("Total Assists", total_assists)

        with col4:
            total_matches = int(player_stats_df["appearances"].max())
            st.metric("Matches Played", total_matches)

        st.markdown("---")

        # Style the dataframe for display
        df_display = style_dataframe(player_stats_df)

        # Display the dataframe with custom formatting
        st.dataframe(
            df_display,
            hide_index=True,
            use_container_width=True,
            height=600,
            column_config={
                "Rank": st.column_config.TextColumn("Rank", width="small"),
                "Player": st.column_config.TextColumn("Player", width="medium"),
                "Apps": st.column_config.NumberColumn("Apps", format="%d"),
                "Goals": st.column_config.NumberColumn("Goals", format="%d"),
                "Assists": st.column_config.NumberColumn("Assists", format="%d"),
                "Clean Sheets": st.column_config.NumberColumn("Clean Sheets", format="%d"),
                "MoM 1": st.column_config.NumberColumn("MoM 1", format="%d"),
                "MoM 2": st.column_config.NumberColumn("MoM 2", format="%d"),
                "MoM 3": st.column_config.NumberColumn("MoM 3", format="%d"),
                "DoD": st.column_config.NumberColumn("DoD", format="%d"),
                "Yellow Cards": st.column_config.NumberColumn("Yellow Cards", format="%d"),
                "Red Cards": st.column_config.NumberColumn("Red Cards", format="%d"),
                "Fantasy Points": st.column_config.NumberColumn(
                    "Fantasy Points",
                    format="%.1f",
                    help="Total fantasy points earned this season",
                ),
            },
        )

        # Top performers section
        st.markdown("---")
        st.markdown("## 🌟 Top Performers")

        col1, col2, col3 = st.columns(3)

        with col1:
            st.markdown("### 🥇 Top Scorer")
            top_scorer = player_stats_df.nlargest(1, "goals")
            if not top_scorer.empty:
                st.markdown(
                    f"**{top_scorer.iloc[0]['name']}**  \n{int(top_scorer.iloc[0]['goals'])} goals"
                )

        with col2:
            st.markdown("### 🅰️ Top Assister")
            top_assister = player_stats_df.nlargest(1, "assists")
            if not top_assister.empty:
                st.markdown(
                    f"**{top_assister.iloc[0]['name']}**  \n{int(top_assister.iloc[0]['assists'])} assists"
                )

        with col3:
            st.markdown("### 🛡️ Most Clean Sheets")
            top_defender = player_stats_df.nlargest(1, "clean_sheets")
            if not top_defender.empty:
                st.markdown(
                    f"**{top_defender.iloc[0]['name']}**  \n{int(top_defender.iloc[0]['clean_sheets'])} clean sheets"
                )

        # Footer
        st.markdown("---")
        st.markdown(
            "<div style='text-align: center; color: #64748b;'>"
            "<p>Data updates automatically on each page load</p>"
            "<p><strong>Up The Park! ⚽</strong></p>"
            "</div>",
            unsafe_allow_html=True,
        )

    except Exception as e:
        st.error(f"Error loading player stats: {str(e)}")
        st.exception(e)


if __name__ == "__main__":
    main()
