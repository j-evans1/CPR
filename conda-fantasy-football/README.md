# CPR Fantasy Football - Python/Streamlit Version

A pure Python implementation of the CPR Fantasy Football application using Streamlit.

## About

This is a Python port of the Next.js-based fantasy football application for **Clissold Park Rangers FC**. It provides real-time player statistics, fantasy league management, and match tracking for the 2025/26 season.

## Features

All features from the Next.js version have been ported to Python/Streamlit:

### ✅ Player Stats Leaderboard (Home Page)
- Real-time fantasy points tracking with sortable statistics
- Medal rankings (🥇🥈🥉) for top 3 performers
- Comprehensive stats: Apps, Goals, Assists, Clean Sheets, MoM, DoD, Cards
- Top performers highlights (top scorer, assister, defender)
- Interactive data table with column sorting

### ✅ Fantasy League (Page 1)
- Team standings sorted by total points
- Expandable team rosters showing all players
- Player details: name, position, price, fantasy points
- Visual rank indicators (medals for top 3)
- Total points calculation from individual players

### ✅ Match Results (Page 2)
- Complete match history for the season
- Filter by team (CPR / CPRA)
- Win/Draw/Loss indicators (✅❌⚖️)
- Expandable match cards with player performances
- Detailed stats per player per match
- Top scorer highlights for each match

### ✅ Payment Tracking (Page 3)
- Comprehensive payment management system
- Match fees (£6 per game) + Season fees (£50)
- Fines integration
- Detailed payment history with breakdowns
- Color-coded balances (red for debt, green for credit)
- Expandable player cards with tabs: Match Fees, Payments, Fines

### ✅ Fines Management (Page 4)
- Dedicated fines tracking system
- Total fines and incident counts
- Average fine calculation
- Detailed fine history for each player
- Breakdown of individual fine incidents
- Filtering logic for regular fines (≤£5) vs miscellaneous

## Installation

### Using Conda (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/j-evans1/CPR.git
cd CPR/conda-fantasy-football
```

2. Create the conda environment:
```bash
conda env create -f environment.yml
```

3. Activate the environment:
```bash
conda activate cpr-fantasy-football
```

4. Run the application:
```bash
streamlit run app.py
```

### Using pip

1. Clone the repository:
```bash
git clone https://github.com/j-evans1/CPR.git
cd CPR/conda-fantasy-football
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
streamlit run app.py
```

## Project Structure

```
conda-fantasy-football/
├── app.py                           # Main app (Player Stats Leaderboard)
├── pages/                           # Multi-page app structure
│   ├── 1_🏆_Fantasy_League.py      # Fantasy league standings
│   ├── 2_⚽_Match_Results.py        # Match results and history
│   ├── 3_💰_Payments.py            # Payment tracking
│   └── 4_🚫_Fines.py               # Fines management
├── src/                             # Data processing modules
│   ├── __init__.py                 # Package initialization
│   ├── config.py                   # Configuration and constants
│   ├── data_fetcher.py             # CSV fetching utilities
│   ├── data_processor.py           # Player stats processing
│   ├── fantasy_processor.py        # Fantasy league processing
│   ├── match_processor.py          # Match data processing
│   ├── payment_processor.py        # Payment calculations
│   └── fines_processor.py          # Fines processing
├── .streamlit/
│   └── config.toml                 # Streamlit theme configuration
├── environment.yml                 # Conda environment specification
├── requirements.txt                # Pip dependencies
├── run.sh                          # Quick start script
└── README.md                       # This file
```

## How It Works

### Data Source
The application fetches data from Google Sheets using published CSV exports:
- **Match Details** - Player performance by match
- **Player Data** - Player information and miscellaneous points
- **Team Selection** - Fantasy team compositions (future)
- **Bank Statement** - Payment records (future)
- **Fines** - Fine details (future)

### Fantasy Points System
Points are calculated based on match performance:
- **Appearance** - Base points for playing
- **Goals** - Points per goal scored
- **Assists** - Points per assist
- **Clean Sheets** - Points for keeping a clean sheet
- **Man of the Match** - Bonus points (1st, 2nd, 3rd)
- **Cards** - Negative points for yellow/red cards
- **Dick of the Day** - Negative points
- **Misc Points** - Manual adjustments

### Caching
The application uses Streamlit's built-in caching (`@st.cache_data`) to cache CSV data for 60 seconds, reducing load times and API calls.

## Development

### Adding New Features

1. Add new data processing functions in `src/`
2. Create new pages in the `pages/` directory (Streamlit multi-page apps)
3. Update the sidebar navigation in `app.py`

### Running Tests

```bash
pytest tests/
```

## Deployment Options

### Option 1: Streamlit Community Cloud (Free)
1. Push code to GitHub
2. Connect repository at [share.streamlit.io](https://share.streamlit.io)
3. Deploy with one click

### Option 2: Docker
```bash
docker build -t cpr-fantasy-football .
docker run -p 8501:8501 cpr-fantasy-football
```

### Option 3: Self-hosted
```bash
conda activate cpr-fantasy-football
streamlit run app.py --server.port 8501
```

## Comparison with Next.js Version

| Feature | Next.js | Python/Streamlit |
|---------|---------|------------------|
| **Language** | TypeScript | Python |
| **UI Framework** | React + Tailwind | Streamlit |
| **Data Processing** | Manual arrays | Pandas DataFrames |
| **Caching** | Custom | Built-in (`@st.cache_data`) |
| **Deployment** | Vercel | Multiple options |
| **Code Lines** | ~2000+ | ~1700 |
| **Development Time** | Weeks | Days |
| **Mobile UX** | Excellent | Good |
| **Pages** | 5 | 5 (all ported) |
| **Interactivity** | Client-side (React) | Server-side (Streamlit) |
| **Customization** | High (CSS control) | Medium (Streamlit components) |
| **Data Science Integration** | Limited | Excellent (pandas, numpy) |

## Tech Stack

- **Python 3.11**
- **Streamlit** - Web application framework
- **Pandas** - Data processing and analysis
- **Requests** - HTTP library for CSV fetching

## Contributing

This is a private project for Clissold Park Rangers FC.

## License

Private project for Clissold Park Rangers FC

---

**Up The Park! ⚽**
