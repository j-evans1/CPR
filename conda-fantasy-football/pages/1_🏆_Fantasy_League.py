"""Fantasy League page - Team standings and rosters."""

import streamlit as st
import pandas as pd
from src.fantasy_processor import get_fantasy_league, get_team_players_df


st.set_page_config(
    page_title="Fantasy League - CPR",
    page_icon="🏆",
    layout="wide",
)


def main():
    """Fantasy League page."""

    st.markdown("# 🏆 FANTASY LEAGUE")
    st.markdown("### Team Standings - Season 2025/26")
    st.markdown("---")

    try:
        with st.spinner("Loading fantasy league data..."):
            teams_df = get_fantasy_league()

        if teams_df.empty:
            st.warning("No fantasy teams found yet.")
            st.info("Fantasy team data will appear here once teams are set up.")
            return

        # Summary metrics
        col1, col2 = st.columns(2)

        with col1:
            st.metric("Teams", len(teams_df))

        with col2:
            top_score = teams_df["total_points"].max()
            st.metric("Top Score", f"{top_score:.1f}")

        st.markdown("---")

        # Display teams with expanders
        for idx, team in teams_df.iterrows():
            rank = team["rank"]
            team_name = team["team_name"]
            manager_name = team["manager_name"]
            total_points = team["total_points"]
            players = team["players"]

            # Determine medal or rank
            if rank == 1:
                rank_display = "🥇"
                bg_color = "#fbbf24"  # gold
            elif rank == 2:
                rank_display = "🥈"
                bg_color = "#9ca3af"  # silver
            elif rank == 3:
                rank_display = "🥉"
                bg_color = "#d97706"  # bronze
            else:
                rank_display = f"#{rank}"
                bg_color = "#334155"  # slate

            # Create expander for each team
            with st.expander(
                f"{rank_display} **{team_name}** - {manager_name} ({total_points:.1f} pts)",
                expanded=(rank == 1),  # Expand first place by default
            ):
                if players:
                    players_df = get_team_players_df(players)

                    st.markdown(f"**Squad ({len(players)} players)**")

                    # Display players table
                    st.dataframe(
                        players_df,
                        hide_index=True,
                        use_container_width=True,
                        column_config={
                            "name": st.column_config.TextColumn("Player", width="medium"),
                            "position": st.column_config.TextColumn("Position", width="small"),
                            "price": st.column_config.NumberColumn("Price", format="£%.1f"),
                            "points": st.column_config.NumberColumn(
                                "Points", format="%.1f"
                            ),
                        },
                    )
                else:
                    st.info("No players in this team yet.")

        # Footer
        st.markdown("---")
        st.markdown(
            "<div style='text-align: center; color: #64748b;'>"
            "<p>Expand any team to view their full roster and player points</p>"
            "<p>Data updates automatically on page refresh</p>"
            "</div>",
            unsafe_allow_html=True,
        )

    except Exception as e:
        st.error(f"Error loading fantasy league: {str(e)}")
        st.exception(e)


if __name__ == "__main__":
    main()
