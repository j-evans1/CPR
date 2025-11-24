"""Payments page - Match fees and payment tracking."""

import streamlit as st
import pandas as pd
from src.payment_processor import get_player_payments
from src.style import load_css


st.set_page_config(
    page_title="Payments - CPR",
    page_icon="💰",
    layout="wide",
)

# Load custom CSS
load_css()


def format_currency(amount: float) -> str:
    """Format amount as currency."""
    return f"£{amount:.2f}"


def main():
    """Payments page."""

    st.markdown("# 💰 PAYMENTS")
    st.markdown("### Match Fees and Payment Status")
    st.markdown("---")

    try:
        with st.spinner("Loading payment data..."):
            players_df = get_player_payments()

        if players_df.empty:
            st.warning("No payment data found yet.")
            return

        # Calculate summary stats
        total_owed = players_df["total_owed"].sum()
        total_paid = players_df["paid"].sum()
        total_outstanding = players_df[players_df["balance"] > 0]["balance"].sum()
        players_in_debt = len(players_df[players_df["balance"] > 0])

        # Summary metrics
        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.metric("Total Owed", format_currency(total_owed))

        with col2:
            st.metric("Total Paid", format_currency(total_paid))

        with col3:
            st.metric("Outstanding", format_currency(total_outstanding))

        with col4:
            st.metric("In Debt", players_in_debt)

        st.markdown("---")

        # Display players with expanders
        for idx, player in players_df.iterrows():
            name = player["name"]
            balance = player["balance"]
            total_owed = player["total_owed"]
            paid = player["paid"]
            match_count = player["match_count"]
            match_fees = player["match_fees"]
            season_fees = player["season_fees"]
            fines = player["fines"]
            match_details = player["match_details"]
            payment_details = player["payment_details"]
            fine_details = player["fine_details"]

            # Determine balance color and text
            if balance > 0:
                balance_text = f"Owes {format_currency(balance)}"
                balance_color = "red"
            elif balance < 0:
                balance_text = f"Credit {format_currency(abs(balance))}"
                balance_color = "green"
            else:
                balance_text = "Paid up"
                balance_color = "gray"

            # Create expander for each player
            with st.expander(
                f"#{idx + 1} **{name}** - {balance_text} ({match_count} matches)",
                expanded=False,
            ):
                # Balance summary
                col1, col2, col3 = st.columns(3)

                with col1:
                    st.markdown("**Total Owed**")
                    st.markdown(f"<h3>{format_currency(total_owed)}</h3>", unsafe_allow_html=True)
                    st.caption(
                        f"Match fees: {format_currency(match_fees)} • Season: {format_currency(season_fees)}"
                    )

                with col2:
                    st.markdown("**Total Paid**")
                    st.markdown(f"<h3 style='color: green;'>{format_currency(paid)}</h3>", unsafe_allow_html=True)
                    st.caption(f"{len(payment_details)} payment(s)")

                with col3:
                    st.markdown("**Balance**")
                    color = "red" if balance > 0 else "green" if balance < 0 else "gray"
                    st.markdown(
                        f"<h3 style='color: {color};'>{format_currency(abs(balance))}</h3>",
                        unsafe_allow_html=True,
                    )
                    st.caption(balance_text)

                st.markdown("---")

                # Tabs for details
                tab1, tab2, tab3 = st.tabs(["Match Fees", "Payments", "Fines"])

                with tab1:
                    if match_details:
                        match_df = pd.DataFrame(match_details)
                        st.dataframe(
                            match_df,
                            hide_index=True,
                            use_container_width=True,
                            column_config={
                                "date": "Date",
                                "game": "Match",
                                "fee": st.column_config.NumberColumn("Fee", format="£%.2f"),
                            },
                        )
                        st.caption(
                            f"Total: {format_currency(sum(m['fee'] for m in match_details))}"
                        )
                    else:
                        st.info("No match fees recorded")

                with tab2:
                    if payment_details:
                        payment_df = pd.DataFrame(payment_details)
                        st.dataframe(
                            payment_df,
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
                        st.caption(
                            f"Total: {format_currency(sum(p['amount'] for p in payment_details))}"
                        )
                    else:
                        st.info("No payments recorded")

                with tab3:
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
                                    "Fine", format="£%.2f"
                                ),
                            },
                        )
                        st.caption(
                            f"Total: {format_currency(sum(f['amount'] for f in fine_details))}"
                        )
                    else:
                        st.info("No fines")

        # Footer
        st.markdown("---")
        st.markdown(
            "<div style='text-align: center; color: #64748b;'>"
            "<p>Expand any player to view detailed payment breakdown</p>"
            "<p>Data updates automatically on page refresh</p>"
            "</div>",
            unsafe_allow_html=True,
        )

    except Exception as e:
        st.error(f"Error loading payments: {str(e)}")
        st.exception(e)


if __name__ == "__main__":
    main()
