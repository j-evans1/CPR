# CPR Fantasy Football - Developer Notes

## Code Structure

### Data Flow
```
Google Sheets CSV → lib/data-fetcher.ts → lib/*-processor.ts → app/**/page.tsx → User
```

### Key Files

#### Configuration
- **lib/constants.ts** - All CSV URLs, column indices, and season configuration
  - `CSV_URLS` - Published Google Sheets URLs
  - `MATCH_COLUMNS` - Column mapping for match data (_1, _2, etc.)
  - `BANK_COLUMNS` - Array indices for bank statement (has no headers)
  - `SEASON_CONFIG` - Season fee settings

#### Data Processing
- **lib/data-fetcher.ts** - Generic CSV fetching with PapaParse
  - `fetchCSV()` - Fetch and parse CSV data
  - `parseNumber()` - Parse numeric values with currency symbols
  - `normalizeString()` - Normalize strings for comparison

- **lib/data-processor.ts** - Player statistics aggregation
  - Aggregates player stats from all matches
  - Adds Misc-Points from Player Data CSV for manual adjustments
  - Calculates total fantasy points per player (match points + Misc-Points)

- **lib/match-processor.ts** - Match data processing
  - Groups players by match
  - Parses match scores and results

- **lib/payment-processor.ts** - Payment tracking
  - Combines player data, match fees, and bank payments
  - Calculates season fees based on appearance threshold
  - Filters bank payments from configured start date

- **lib/fantasy-processor.ts** - Fantasy league teams
  - Processes team selection data
  - Aggregates team points from player performances

#### Pages
- **app/page.tsx** - Player stats leaderboard
- **app/league/page.tsx** - Fantasy league standings
- **app/matches/page.tsx** - Match results with player performances
- **app/payments/page.tsx** - Payment tracker
- **app/validation/page.tsx** - Data validation comparing app vs spreadsheet

## Important Notes

### CSV Data Sources

1. **Match Details CSV**
   - Has 3 header rows that must be skipped: `matchData.slice(3)`
   - Uses `_1`, `_2`, `_3` etc. for column names (PapaParse auto-generated)
   - Has duplicate "Gameweek" column (position 3 and 31) - warning is harmless

2. **Bank Statement CSV**
   - **NO HEADERS** - must be fetched with `fetchCSV(url, false)`
   - Access by array index using `BANK_COLUMNS` constants
   - Columns: [Date, Description, Type, Credit, Debit, Balance, Player]

3. **Player Data CSV**
   - Has proper headers (Player, Fees, Payments, Due, Appearance, etc.)
   - Can be accessed by column name

### Configuration Changes

To modify season settings, edit `lib/constants.ts`:
- Season fee amount: `SEASON_CONFIG.SEASON_FEE`
- Appearance threshold: `SEASON_CONFIG.SEASON_FEE_THRESHOLD`
- Payment start date: `SEASON_CONFIG.PAYMENT_START_DATE`

### Common Issues

1. **Column Index Mismatches**
   - Always use constants from `lib/constants.ts`
   - Never hardcode column indices like `row._5`
   - Match processor and data processor must use same indices

2. **Bank Payment Parsing**
   - Bank CSV has no headers - use array indices
   - Remember to filter by payment start date
   - Player name in column 6 (index)

3. **Duplicate Headers Warning**
   - Expected from spreadsheet structure
   - Doesn't affect functionality
   - Can be ignored

## Data Validation

The validation page (`/validation`) compares app calculations against spreadsheet values:
- Fantasy points (including Misc-Points manual adjustments)
- Appearances, goals, assists, clean sheets
- Match fees (before season fee), payments, and balances

**Important Notes:**
- Fantasy points include **Misc-Points** from the Player Data CSV for manual adjustments
- Match fees are validated **before** the £50 season fee is applied
- The spreadsheet's "Fees" column only contains match fees, not season fees

**All checks should pass 100%** if the code is working correctly.

## Development

```bash
npm run dev    # Start dev server on http://localhost:3000
npm run build  # Production build
npm run start  # Start production server
```

## Future Improvements

See the main README for a full list of potential improvements including:
- Caching strategy
- Data reconciliation alerts
- Historical tracking
- Export functionality
- Search and filtering
