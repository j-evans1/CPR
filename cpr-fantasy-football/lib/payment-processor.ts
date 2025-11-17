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
    // Fetch player data and fines
    const [playerData, finesData] = await Promise.all([
      fetchCSV<any>(CSV_URLS.PLAYER_DATA),
      fetchCSV<any>(CSV_URLS.FINES),
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
        fines: 0, // Will be calculated from fees total and match fees
        totalOwed: fees,
        paid: payments,
        balance: due,
        matchCount: appearance,
        fineDetails: [],
      });
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

    // Calculate total fines from fine details
    for (const player of playerMap.values()) {
      player.fines = player.fineDetails.reduce((sum, fine) => sum + fine.amount, 0);
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
