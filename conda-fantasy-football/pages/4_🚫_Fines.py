"""Fines page - Player fines and penalties."""

import streamlit as st
import pandas as pd
from src.fines_processor import get_player_fines, calculate_filtered_fines
from src.style import load_css


st.set_page_config(
    page_title="Fines - CPR",
    page_icon="🚫",
    layout="wide",
)

# Load custom CSS
load_css()


def format_currency(amount: float) -> str:
    """Format amount as currency."""
    return f"£{amount:.2f}"


def main():
    """Fines page."""

    st.markdown("# 🚫 FINES")
    st.markdown("### Player Fines and Penalties")
    st.markdown("---")

    try:
        with st.spinner("Loading fines data..."):
            players_df = get_player_fines()

        if players_df.empty:
            st.warning("No fines data found.")
            st.info("Player fines will appear here once recorded.")
            return

        # Calculate summary stats (excluding fines above £5)
        total_fines = 0.0
        total_count = 0
        for _, player in players_df.iterrows():
            filtered = calculate_filtered_fines(player["fine_details"], max_amount=5.0)
            total_fines += filtered["total"]
            total_count += filtered["count"]

        average_fine = total_fines / total_count if total_count > 0 else 0.0

        # Summary metrics
        col1, col2, col3 = st.columns(3)

        with col1:
            st.metric("Total Fines", format_currency(total_fines))

        with col2:
            st.metric("Total Incidents", total_count)

        with col3:
            st.metric("Avg Fine", format_currency(average_fine))

        st.markdown("---")

        # Sort players by filtered fines (≤ £5 only) for proper display order
        def get_filtered_total(player_row):
            filtered = calculate_filtered_fines(player_row["fine_details"], max_amount=5.0)
            return filtered["total"]

        players_df["_filtered_total"] = players_df.apply(get_filtered_total, axis=1)
        players_df = players_df.sort_values("_filtered_total", ascending=False).reset_index(
            drop=True
        )

        # Display players with expanders
        for idx, player in players_df.iterrows():
            name = player["name"]
            total_fines = player["total_fines"]
            fine_count = player["fine_count"]
            fine_details = player["fine_details"]

            # Calculate filtered totals for display (≤ £5 only)
            filtered = calculate_filtered_fines(fine_details, max_amount=5.0)
            display_total = filtered["total"]
            display_count = filtered["count"]
            display_avg = filtered["average"]

            # Create expander for each player
            with st.expander(
                f"#{idx + 1} **{name}** - {format_currency(display_total)} ({display_count} fine{'s' if display_count != 1 else ''})",
                expanded=False,
            ):
                # Summary
                col1, col2, col3 = st.columns(3)

                with col1:
                    st.markdown("**Total Fines**")
                    st.markdown(
                        f"<h3 style='color: red;'>{format_currency(total_fines)}</h3>",
                        unsafe_allow_html=True,
                    )

                with col2:
                    st.markdown("**Incidents**")
                    st.markdown(f"<h3>{fine_count}</h3>", unsafe_allow_html=True)

                with col3:
                    st.markdown("**Average**")
                    st.markdown(
                        f"<h3>{format_currency(display_avg)}</h3>",
                        unsafe_allow_html=True,
                    )

                # Breakdown
                regular_fines = sum(f["amount"] for f in fine_details if f["amount"] <= 5)
                miscellaneous = sum(f["amount"] for f in fine_details if f["amount"] > 5)

                if miscellaneous > 0:
                    st.caption(
                        f"{format_currency(regular_fines)} in fines + {format_currency(miscellaneous)} Miscellaneous"
                    )

                st.markdown("---")

                # Fine details table
                st.markdown("**Fine Details**")
                if fine_details:
                    fine_df = pd.DataFrame(fine_details)
                    st.dataframe(
                        fine_df,
                        hide_index=True,
                        use_container_width=True,
                        column_config={
                            "date": "Date",
                            "description": "Description",
                            "amount": st.column_config.NumberColumn(
                                "Amount", format="£%.2f"
                            ),
                        },
                    )

                    # Total row
                    st.markdown(
                        f"**Total ({fine_count} fine{'s' if fine_count != 1 else ''}):** {format_currency(total_fines)}",
                    )
                else:
                    st.info("No fines recorded")

        # Footer
        st.markdown("---")
        st.markdown(
            "<div style='text-align: center; color: #64748b;'>"
            "<p>Expand any player to view detailed fine history</p>"
            "<p>Data updates automatically on page refresh</p>"
            "</div>",
            unsafe_allow_html=True,
        )

    except Exception as e:
        st.error(f"Error loading fines: {str(e)}")
        st.exception(e)


if __name__ == "__main__":
    main()
