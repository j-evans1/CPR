"""Match Results page - All matches from the season."""

import streamlit as st
import pandas as pd
from src.match_processor import get_matches, get_match_result_badge


st.set_page_config(
    page_title="Match Results - CPR",
    page_icon="⚽",
    layout="wide",
)


def main():
    """Match Results page."""

    st.markdown("# ⚽ MATCH RESULTS")
    st.markdown("### Season 2025/26 - All Matches")
    st.markdown("---")

    try:
        with st.spinner("Loading match data..."):
            matches = get_matches()

        if not matches:
            st.warning("No matches found yet.")
            st.info("Match results will appear here once games are played.")
            return

        # Filter by team
        teams = sorted(set(m["team"] for m in matches))
        if len(teams) > 1:
            selected_team = st.selectbox(
                "Filter by team:",
                ["All"] + teams,
                index=0,
            )

            if selected_team != "All":
                matches = [m for m in matches if m["team"] == selected_team]

        # Summary metrics
        col1, col2, col3, col4 = st.columns(4)

        total_matches = len(matches)
        wins = sum(1 for m in matches if m["cpr_score"] > m["opponent_score"])
        draws = sum(1 for m in matches if m["cpr_score"] == m["opponent_score"])
        losses = sum(1 for m in matches if m["cpr_score"] < m["opponent_score"])

        with col1:
            st.metric("Matches", total_matches)

        with col2:
            st.metric("Wins", wins)

        with col3:
            st.metric("Draws", draws)

        with col4:
            st.metric("Losses", losses)

        st.markdown("---")

        # Display matches with expanders
        for match in matches:
            date = match["date"]
            team = match["team"]
            opponent = match["opponent"]
            score = match["score"]
            cpr_score = match["cpr_score"]
            opponent_score = match["opponent_score"]
            gameweek = match["gameweek"]
            players = match["players"]

            # Result badge
            result = get_match_result_badge(cpr_score, opponent_score)

            # Result text
            if cpr_score > opponent_score:
                result_text = "WIN"
                result_color = "green"
            elif cpr_score < opponent_score:
                result_text = "LOSS"
                result_color = "red"
            else:
                result_text = "DRAW"
                result_color = "orange"

            # Create expander for each match
            with st.expander(
                f"{result} **{date}** - {team} {score} {opponent} - *{result_text}*",
                expanded=False,
            ):
                st.markdown(f"**Gameweek:** {gameweek}")
                st.markdown(f"**Result:** {team} {score} {opponent}")

                if players:
                    # Convert players to DataFrame
                    players_df = pd.DataFrame(players)

                    # Sort by points (descending)
                    players_df = players_df.sort_values(
                        "points", ascending=False
                    ).reset_index(drop=True)

                    st.markdown("---")
                    st.markdown(f"**Player Performances ({len(players)} players)**")

                    # Display players table
                    st.dataframe(
                        players_df,
                        hide_index=True,
                        use_container_width=True,
                        column_config={
                            "name": st.column_config.TextColumn("Player", width="medium"),
                            "appearance": st.column_config.NumberColumn("App", format="%d"),
                            "goals": st.column_config.NumberColumn("Goals", format="%d"),
                            "assists": st.column_config.NumberColumn("Assists", format="%d"),
                            "clean_sheet": st.column_config.NumberColumn(
                                "CS", format="%d"
                            ),
                            "yellow_card": st.column_config.NumberColumn(
                                "YC", format="%d"
                            ),
                            "red_card": st.column_config.NumberColumn("RC", format="%d"),
                            "points": st.column_config.NumberColumn(
                                "Fantasy Pts", format="%.1f"
                            ),
                        },
                    )

                    # Top performers
                    top_scorer = players_df.nlargest(1, "goals")
                    if not top_scorer.empty and top_scorer.iloc[0]["goals"] > 0:
                        st.success(
                            f"⚽ **Top Scorer:** {top_scorer.iloc[0]['name']} ({int(top_scorer.iloc[0]['goals'])} goals)"
                        )

        # Footer
        st.markdown("---")
        st.markdown(
            "<div style='text-align: center; color: #64748b;'>"
            "<p>Expand any match to view detailed player performances</p>"
            "<p>Data updates automatically on page refresh</p>"
            "</div>",
            unsafe_allow_html=True,
        )

    except Exception as e:
        st.error(f"Error loading match results: {str(e)}")
        st.exception(e)


if __name__ == "__main__":
    main()
