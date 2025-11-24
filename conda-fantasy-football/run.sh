#!/bin/bash
# Quick start script for CPR Fantasy Football

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting CPR Fantasy Football...${NC}"

# Check if conda environment exists
if ! /opt/anaconda3/bin/conda env list | grep -q "cpr-fantasy-football"; then
    echo "Creating conda environment..."
    /opt/anaconda3/bin/conda env create -f environment.yml
fi

echo -e "${GREEN}Starting Streamlit app...${NC}"
echo -e "${GREEN}Access the app at: http://localhost:8501${NC}"
echo ""
echo "Press Ctrl+C to stop the server"

# Activate environment and run app
/opt/anaconda3/envs/cpr-fantasy-football/bin/streamlit run app.py
