import { fetchCSV } from './data-fetcher';
import { CSV_URLS } from './constants';

export interface PlayerFineDetail {
  name: string;
  totalFines: number;
  fineCount: number;
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
 * Fetches and processes player fines information
 * @returns Array of player fine details sorted by total fines (highest first)
 */
export async function getPlayerFines(): Promise<PlayerFineDetail[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finesData = await fetchCSV<any>(CSV_URLS.FINES, false);

    const playerMap = new Map<string, PlayerFineDetail>();

    // Process fines data
    // Skip first 4 rows: 2 header rows + 1 empty row + 1 column header row
    // PapaParse with headers=false uses 0-based array indices
    const finesRows = finesData.slice(4);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    finesRows.forEach((row: any) => {
      // When headers=false, PapaParse returns arrays, not objects
      // Column indices: 0 is empty, 1 is Date, 2 is Fines, 3 is Description, 4 is Player
      const playerName = String(row[4] || '').trim();
      const fine = parseCurrency(row[2]);
      const date = String(row[1] || '').trim();
      const description = String(row[3] || '').trim();

      if (!playerName || !date) return;
      if (fine <= 0) return; // Skip rows with no fine amount

      const normalized = normalizePlayerName(playerName);

      let player = playerMap.get(normalized);
      if (!player) {
        player = {
          name: playerName,
          totalFines: 0,
          fineCount: 0,
          fineDetails: [],
        };
        playerMap.set(normalized, player);
      }

      player.totalFines += fine;
      player.fineCount += 1;
      player.fineDetails.push({ date, amount: fine, description });
    });

    // Sort fine details by date for each player
    for (const player of playerMap.values()) {
      player.fineDetails.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateA.getTime() - dateB.getTime();
      });
    }

    // Convert to array and sort by total fines (highest first)
    const players = Array.from(playerMap.values());
    players.sort((a, b) => b.totalFines - a.totalFines);

    return players;
  } catch (error) {
    console.error('Error processing player fines:', error);
    throw error;
  }
}
