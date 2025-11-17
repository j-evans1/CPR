import { fetchCSV } from './data-fetcher';
import { CSV_URLS, MATCH_COLUMNS, BANK_COLUMNS, SEASON_CONFIG } from './constants';

export interface PlayerPaymentDetail {
  name: string;
  matchFees: number;
  seasonFees: number;
  fines: number;
  totalOwed: number;
  paid: number;
  balance: number;
  matchCount: number;
  matchDetails: { date: string; fee: number; gameweek: string }[];
  paymentDetails: { date: string; amount: number; description: string }[];
  fineDetails: { date: string; amount: number; description: string }[];
}

/**
 * Parse currency string (e.g., "£12.00" -> 12.00)
 */
function parseCurrency(value: string): number {
  if (!value) return 0;
  const cleaned = String(value).replace(/[£,]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Normalize player names for matching across different data sources
 */
function normalizePlayerName(name: string): string {
  if (!name) return '';
  return name.toLowerCase().trim();
}

/**
 * Fetches and processes player payment information
 * Combines data from player data, match fees, and bank statement
 * @returns Array of player payment details sorted by balance (highest debt first)
 */
export async function getPlayerPayments(): Promise<PlayerPaymentDetail[]> {
  try {
    // Fetch all data sources
    // Note: Bank statement CSV has no headers, so we fetch it without header parsing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [playerData, matchData, bankData, finesData] = await Promise.all<any[]>([
      fetchCSV(CSV_URLS.PLAYER_DATA),
      fetchCSV(CSV_URLS.MATCH_DETAILS),
      fetchCSV(CSV_URLS.BANK_STATEMENT, false), // false = no headers, access by index
      fetchCSV(CSV_URLS.FINES, false), // false = no headers, access by index
    ]);

    const playerMap = new Map<string, PlayerPaymentDetail>();

    // Process player data (has Fees, Payments, Due columns)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playerData.forEach((row: any) => {
      const playerName = String(row.Player || '').trim();
      const fees = parseCurrency(row.Fees);
      const payments = parseCurrency(row.Payments);
      const due = parseCurrency(row.Due);
      const appearance = Number(row.Appearance) || 0;

      if (!playerName) return;

      const normalized = normalizePlayerName(playerName);
      playerMap.set(normalized, {
        name: playerName,
        matchFees: fees,
        seasonFees: 0, // Will be calculated later
        fines: 0, // Will be calculated from fines CSV
        totalOwed: fees,
        paid: payments,
        balance: due,
        matchCount: appearance,
        matchDetails: [],
        paymentDetails: [],
        fineDetails: [],
      });
    });
       

    // Process match details to get match fees per game (skip first 3 rows)
    const matchRows = matchData.slice(3);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    matchRows.forEach((row: any) => {
      const playerName = String(row[MATCH_COLUMNS.PLAYER] || '').trim();
      const fee = parseCurrency(row[MATCH_COLUMNS.FEE]);
      const date = String(row[MATCH_COLUMNS.DATE] || '').trim();
      const gameweek = String(row[MATCH_COLUMNS.GAMEWEEK] || '').trim();

      if (!playerName || !date) return;

      const normalized = normalizePlayerName(playerName);
      const player = playerMap.get(normalized);

      if (player && fee > 0) {
        player.matchDetails.push({ date, fee, gameweek });
      }
     
    });

    // Process bank payments
    // Bank statement CSV has no headers, access by index using BANK_COLUMNS constants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bankData.forEach((row: any) => {
      const date = String(row[BANK_COLUMNS.DATE] || '').trim();
      const description = String(row[BANK_COLUMNS.DESCRIPTION] || '').trim();
      const payment = parseCurrency(row[BANK_COLUMNS.CREDIT]);
      const playerNameFromBank = String(row[BANK_COLUMNS.PLAYER] || '').trim();

      // Skip if no player name in column G
      if (!playerNameFromBank) return;

      // Skip if no payment amount
      if (payment === 0) return;

      // Skip if no date
      if (!date) return;

      // Parse date and filter for dates from 01/08/2025 onwards
      const dateParts = date.split('/');
      if (dateParts.length !== 3) return; // Invalid date format

      const [day, month, year] = dateParts.map(Number);

      // Validate date parts
      if (isNaN(day) || isNaN(month) || isNaN(year)) return;

      const rowDate = new Date(year, month - 1, day);

      // Only process dates from the configured payment start date onwards
      if (rowDate < SEASON_CONFIG.PAYMENT_START_DATE) return;

      // Match player by the Player column in bank statement
      const normalized = normalizePlayerName(playerNameFromBank);
      const player = playerMap.get(normalized);

      if (player) {
        player.paymentDetails.push({ date, amount: payment, description });
      }
    });

    // Process fines data
    // Skip first 4 rows: 2 header rows + 1 empty row + 1 column header row
    // PapaParse with headers=false uses 0-based array indices
    const finesRows = finesData.slice(4);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    finesRows.forEach((row: any) => {
      // When headers=false, PapaParse returns arrays
      // Column indices: 0 is empty, 1 is Date, 2 is Fines, 3 is Description, 4 is Player
      const playerName = String(row[4] || '').trim();
      const fine = parseCurrency(row[2]);
      const date = String(row[1] || '').trim();
      const description = String(row[3] || '').trim();

      if (!playerName || !date) return;
      if (fine <= 0) return;

      const normalized = normalizePlayerName(playerName);
      const player = playerMap.get(normalized);

      if (player) {
        player.fines += fine;
        player.fineDetails.push({ date, amount: fine, description });
      }
    });

    // Calculate season fees and update totalOwed
    for (const player of playerMap.values()) {
      // Apply season fee if player has played more than threshold number of games
      player.seasonFees = player.matchCount > SEASON_CONFIG.SEASON_FEE_THRESHOLD
        ? SEASON_CONFIG.SEASON_FEE
        : 0;

      // Update totalOwed to include season fees (fines are already in matchFees from CSV)
      player.totalOwed = player.matchFees + player.seasonFees;

      // Recalculate balance as Total Owed - Total Paid
      player.balance = player.totalOwed - player.paid;

      // Sort match details by date (oldest first)
      player.matchDetails.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateA.getTime() - dateB.getTime();
      });

      // Sort payment details by date (oldest first)
      player.paymentDetails.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateA.getTime() - dateB.getTime();
      });

      // Sort fine details by date (oldest first)
      player.fineDetails.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateA.getTime() - dateB.getTime();
      });
    }

    // Convert to array, filter out inactive players, and sort by balance (highest debt first)
    const players = Array.from(playerMap.values())
      .filter(player => player.matchCount > 0 || player.fines > 0);
    players.sort((a, b) => b.balance - a.balance);

    return players;
  } catch (error) {
    console.error('Error processing player payments:', error);
    throw error;
  }
}
