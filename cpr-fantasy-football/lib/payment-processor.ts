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

    // Process fines to get fine details (skip first 4 rows)
    const fineRows = finesData.slice(4);
    fineRows.forEach((row: any) => {
      const playerName = String(row._4 || '').trim();
      const fine = parseCurrency(row._2);
      const date = String(row._1 || '').trim();
      const description = String(row._3 || '').trim();

      if (!playerName || fine === 0) return;

      const normalized = normalizePlayerName(playerName);
      const player = playerMap.get(normalized);

      if (player) {
        player.fineDetails.push({ date, amount: fine, description });
      }
    });

    // Process bank payments
    bankData.forEach((row: any) => {
      const description = String(row.Description || '').trim();
      const payment = parseCurrency(row.In);
      const date = String(row.Date || '').trim();

      if (!description || payment === 0) return;

      // Try to match player name from description
      for (const [key, player] of playerMap.entries()) {
        const playerNameLower = normalizePlayerName(player.name);
        const descriptionLower = normalizePlayerName(description);

        // Check if description contains player name or parts of it
        const nameParts = player.name.split(' ');
        const matchesName = nameParts.some(part =>
          part.length > 1 && descriptionLower.includes(normalizePlayerName(part))
        );

        if (matchesName || descriptionLower.includes(playerNameLower)) {
          player.paymentDetails.push({ date, amount: payment, description });
          break;
        }
      }
    });

    // Calculate total fines from fine details
    for (const player of playerMap.values()) {
      player.fines = player.fineDetails.reduce((sum, fine) => sum + fine.amount, 0);

      // Sort match details by date (most recent first)
      player.matchDetails.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateB.getTime() - dateA.getTime();
      });

      // Sort payment details by date (most recent first)
      player.paymentDetails.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateB.getTime() - dateA.getTime();
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
