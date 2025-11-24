"""Styling utilities for CPR Fantasy Football."""

import streamlit as st
from pathlib import Path


def load_css():
    """Load and inject custom CSS to match Next.js app styling."""
    css_file = Path(__file__).parent.parent / ".streamlit" / "style.css"

    if css_file.exists():
        with open(css_file) as f:
            st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)
