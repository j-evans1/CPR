# CPR Fantasy Football 2025/26

A fantasy football application for **Clissold Park Rangers FC**, tracking player statistics, team standings, and league management for the 2025/26 season.

## About Clissold Park Rangers FC

Clissold Park Rangers FC is a Saturday afternoon football club based in Barnes, London. We compete in local leagues every Saturday, bringing together a passionate group of players who love the beautiful game. Our home matches are played at the Barnes pitches, where we showcase skill, teamwork, and competitive spirit throughout the season.

The club represents the spirit of grassroots football in London, with players from diverse backgrounds coming together each weekend to compete, improve, and enjoy football at its finest.

## About This App

This fantasy football application brings the excitement of fantasy sports to our Saturday league. Players can draft their own teams from the CPR squad, track live statistics, manage payments, and compete against each other throughout the season.

Built with modern web technologies, the app automatically syncs with Google Sheets to provide real-time updates on player performances, match results, and league standings.

## Features

### 🏆 Player Stats Leaderboard
- Real-time fantasy points tracking for all players
- Comprehensive statistics including goals, assists, clean sheets, cards, and Man of the Match awards
- Sortable leaderboard with medal indicators for top 3 performers
- Sticky columns for easy navigation through extensive stats

### ⚽ Fantasy League
- Team-based competition with 11-player squads
- Position-based selection (GK, DEF, MID, FWD)
- Live points calculation based on player performances
- Expandable team rosters showing individual player contributions
- Real-time league standings

### 📊 Match Results
- Complete match history for the season
- Detailed player performances for each match
- Color-coded results (Win/Draw/Loss)
- Statistics breakdown including goals, assists, clean sheets, and cards
- Expandable match cards for detailed view

### 💰 Payments Tracker
- Comprehensive payment management system
- Match fees tracking (£6 per game)
- Season fee calculation (£50 after 1+ matches)
- Fines integration
- Detailed payment history and balance tracking
- Color-coded balances (red for debt, green for credit)

### 🚫 Fines Management
- Dedicated fines tracking system
- Detailed fine history for each player
- Total fines and average fine calculations
- Breakdown of individual fine incidents

## How It Works

### Data Source
The app fetches data from Google Sheets using published CSV exports. The spreadsheet contains:
- **Match Details**: Date, opponent, result, player statistics
- **Player Data**: Names, positions, prices, miscellaneous points
- **Team Selection**: Fantasy team compositions
- **Bank Statement**: Payment records
- **Fines**: Fine details and amounts

### Automatic Updates
- Data refreshes on every page load
- No caching - always shows the latest information
- Server-side rendering ensures data is always current

### Fantasy Points System
Points are calculated based on match performance:
- **Appearance**: Base points for playing
- **Goals**: Points per goal scored
- **Assists**: Points per assist
- **Clean Sheets**: Points for keeping a clean sheet
- **Man of the Match**: Bonus points (1st, 2nd, 3rd)
- **Cards**: Negative points for yellow/red cards
- **Own Goals**: Negative points
- **Dick of the Day**: Negative points
- **Misc Points**: Manual adjustments for special circumstances

### Payment System
- **Match Fees**: £6 per match played
- **Season Fee**: £50 (applies after playing more than 1 match)
- **Fines**: Added to total amount owed
- **Balance Calculation**: Total Owed - Total Paid = Balance
- **Payment Tracking**: All payments recorded from August 1, 2025 onwards

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: PapaParse (CSV parsing)
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## Project Structure

```
cpr-fantasy-football/
├── app/
│   ├── page.tsx              # Player Stats Leaderboard
│   ├── league/page.tsx       # Fantasy League Standings
│   ├── matches/page.tsx      # Match Results
│   ├── payments/page.tsx     # Payments Tracker
│   ├── fines/page.tsx        # Fines Management
│   └── layout.tsx            # Root layout with navigation
├── components/
│   ├── MatchCard.tsx         # Match result card
│   ├── TeamCard.tsx          # Fantasy team card
│   ├── PlayerDetailModal.tsx # Payment details modal
│   └── Navigation.tsx        # Main navigation
├── lib/
│   ├── constants.ts          # Configuration and constants
│   ├── data-fetcher.ts       # CSV fetching utilities
│   ├── data-processor.ts     # Player stats processing
│   ├── fantasy-processor.ts  # Fantasy league processing
│   ├── match-processor.ts    # Match data processing
│   ├── payment-processor.ts  # Payment calculations
│   ├── fines-processor.ts    # Fines processing
│   └── types.ts              # TypeScript type definitions
└── public/                   # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/j-evans1/CPR.git
cd CPR/cpr-fantasy-football
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Configuration

All configuration is managed in `lib/constants.ts`:

```typescript
// CSV Data Source URLs
export const CSV_URLS = {
  MATCH_DETAILS: 'https://...',
  PLAYER_DATA: 'https://...',
  TEAM_SELECTION: 'https://...',
  BANK_STATEMENT: 'https://...',
  FINES: 'https://...',
};

// Season Configuration
export const SEASON_CONFIG = {
  SEASON_FEE: 50,
  SEASON_FEE_THRESHOLD: 1,
  PAYMENT_START_DATE: new Date(2025, 7, 1),
};
```

## Deployment

The app is deployed on Vercel with automatic deployments from the main branch:

1. Push changes to GitHub
2. Vercel automatically builds and deploys
3. Changes are live within 1-2 minutes

Deploy URL: [https://cpr-fantasy-football.vercel.app](https://cpr-fantasy-football.vercel.app)

## Development

### Key Technologies

- **Next.js App Router**: Modern React framework with server components
- **Server-Side Rendering**: All data fetched on the server for optimal performance
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **PapaParse**: Robust CSV parsing for Google Sheets data

### Adding New Features

1. Create new page in `app/` directory
2. Add data processing logic in `lib/`
3. Create reusable components in `components/`
4. Update navigation in `components/Navigation.tsx`
5. Test locally and deploy

## License

Private project for Clissold Park Rangers FC

## Contact

For questions or issues, please contact the development team or create an issue in the repository.

---

**Up The Park! ⚽**
