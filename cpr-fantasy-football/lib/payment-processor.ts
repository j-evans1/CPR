import { fetchCSV } from './data-fetcher';
import { CSV_URLS } from './constants';

export interface PlayerPaymentDetail {
  name: string;
  matchFees: number;
  fines: number;
  totalOwed: number;
  paid: number;
  balance: number;
  matchCount: number;
  fineDetails: { date: string; amount: number; description: string }[];
  matchDetails: { date: string; fee: number; gameweek: string }[];
  paymentDetails: { date: string; amount: number; description: string }[];
}

// Parse currency string (e.g., "£12.00" -> 12.00)
function parseCurrency(value: string): number {
  if (!value) return 0;
  const cleaned = String(value).replace(/[£,]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Normalize player names for matching
function normalizePlayerName(name: string): string {
  if (!name) return '';
  return name.toLowerCase().trim();
}

export async function getPlayerPayments(): Promise<PlayerPaymentDetail[]> {
  try {
    // Fetch all data sources
    const [playerData, finesData, matchData, bankData] = await Promise.all([
      fetchCSV<any>(CSV_URLS.PLAYER_DATA),
      fetchCSV<any>(CSV_URLS.FINES),
      fetchCSV<any>(CSV_URLS.MATCH_DETAILS),
      fetchCSV<any>(CSV_URLS.BANK_STATEMENT),
    ]);

    const playerMap = new Map<string, PlayerPaymentDetail>();

    // Process player data (has Fees, Payments, Due columns)
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
        fines: 0,
        totalOwed: fees,
        paid: payments,
        balance: due,
        matchCount: appearance,
        fineDetails: [],
        matchDetails: [],
        paymentDetails: [],
      });
    });

    // Process match details to get match fees per game (skip first 3 rows)
    const matchRows = matchData.slice(3);
    matchRows.forEach((row: any) => {
      const playerName = String(row._5 || '').trim();
      const fee = parseCurrency(row._2);
      const date = String(row._1 || '').trim();
      const gameweek = String(row._3 || '').trim();

      if (!playerName || !date) return;

      const normalized = normalizePlayerName(playerName);
      const player = playerMap.get(normalized);

      if (player && fee > 0) {
        player.matchDetails.push({ date, fee, gameweek });
      }
    });

    // Process fines - just sum up fine amounts by player, ignore dates/descriptions
    finesData.forEach((row: any, index: number) => {
      // Skip header rows (first 4 rows)
      if (index < 4) return;

      // Column mapping: _3=Fines, _4=Description, _5=Player
      const fine = parseCurrency(row._3);
      let playerName = String(row._5 || '').trim();
      const description = String(row._4 || '').trim();

      if (fine === 0) return;

      // If Player column is empty, try to extract player name from description
      if (!playerName && description) {
        // Try to match player names from the description
        for (const [key, player] of playerMap.entries()) {
          const descriptionLower = normalizePlayerName(description);
          const playerNameLower = normalizePlayerName(player.name);

          // Check if description starts with or contains the player name
          // Also check for first name matches (e.g., "Ari" for "A. Cela")
          const nameParts = player.name.split(/[\s.]+/).filter(p => p.length > 1);
          const matchesName = nameParts.some(part => {
            const partLower = normalizePlayerName(part);
            return partLower.length > 2 && (
              descriptionLower.startsWith(partLower + ' ') ||
              descriptionLower.startsWith(partLower + ' -') ||
              descriptionLower.includes(' ' + partLower + ' ')
            );
          });

          if (matchesName || descriptionLower.startsWith(playerNameLower)) {
            playerName = player.name;
            break;
          }
        }
      }

      if (!playerName) return;

      const normalized = normalizePlayerName(playerName);
      const player = playerMap.get(normalized);

      if (player) {
        player.fines += fine;
      }
    });

    // Process bank payments
    // Only process rows from 01/08/2025 onwards with Player name in column G
    bankData.forEach((row: any) => {
      const description = String(row.Description || '').trim();
      const payment = parseCurrency(row.In);
      const date = String(row.Date || '').trim();
      const playerNameFromBank = String(row.Player || '').trim();

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
      const cutoffDate = new Date(2025, 7, 1); // August 1, 2025 (month is 0-indexed)

      // Only process dates from Aug 1, 2025 onwards
      if (rowDate < cutoffDate) return;

      // Match player by the Player column in bank statement
      const normalized = normalizePlayerName(playerNameFromBank);
      const player = playerMap.get(normalized);

      if (player) {
        player.paymentDetails.push({ date, amount: payment, description });
      }
    });

    // Sort match and payment details
    for (const player of playerMap.values()) {
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
    }

    // Convert to array and sort by balance (highest debt first)
    const players = Array.from(playerMap.values());
    players.sort((a, b) => b.balance - a.balance);

    return players;
  } catch (error) {
    console.error('Error processing player payments:', error);
    throw error;
  }
}
