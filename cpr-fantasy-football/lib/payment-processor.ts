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
  paymentDetails: { date: string; amount: number }[];
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

// Extract player name from bank statement description
function extractPlayerName(description: string): string {
  if (!description) return '';

  // Try to extract name from various formats
  // "BRUCE A J W/JUN07 , ANDREW BRUCE , ..."
  // "J WALKER , FOOTBALL , ..."
  // "G LAKE , FEES , ..."

  const parts = description.split(',');
  if (parts.length > 0) {
    const firstPart = parts[0].trim();
    // Remove dates and extra info
    const cleaned = firstPart.replace(/\/[A-Z]+\d+/gi, '').trim();
    return cleaned;
  }

  return description.trim();
}

// Map common name variations
function mapPlayerName(name: string): string {
  const normalized = normalizePlayerName(name);

  // Add common variations here if needed
  const nameMap: { [key: string]: string } = {
    'j young': 'j. young',
    'joshua young': 'j. young',
    'g lake': 'g. lake',
    'george lake': 'g. lake',
    // Add more mappings as needed
  };

  return nameMap[normalized] || name;
}

export async function getPlayerPayments(): Promise<PlayerPaymentDetail[]> {
  try {
    // Fetch all data sources
    const [matchData, finesData, bankData] = await Promise.all([
      fetchCSV<any>(CSV_URLS.MATCH_DETAILS),
      fetchCSV<any>(CSV_URLS.FINES),
      fetchCSV<any>(CSV_URLS.BANK_STATEMENT),
    ]);

    const playerMap = new Map<string, PlayerPaymentDetail>();

    // Process match fees (skip first 3 rows)
    const matchRows = matchData.slice(3);
    matchRows.forEach((row: any) => {
      const playerName = String(row._5 || '').trim();
      const fee = parseCurrency(row._2);
      const date = String(row._1 || '').trim();

      if (!playerName || fee === 0) return;

      const normalized = normalizePlayerName(playerName);
      if (!playerMap.has(normalized)) {
        playerMap.set(normalized, {
          name: playerName,
          matchFees: 0,
          fines: 0,
          totalOwed: 0,
          paid: 0,
          balance: 0,
          matchCount: 0,
          fineDetails: [],
          paymentDetails: [],
        });
      }

      const player = playerMap.get(normalized)!;
      player.matchFees += fee;
      player.matchCount += 1;
    });

    // Process fines (skip first 4 rows)
    const fineRows = finesData.slice(4);
    fineRows.forEach((row: any) => {
      const playerName = String(row._4 || '').trim();
      const fine = parseCurrency(row._2);
      const date = String(row._1 || '').trim();
      const description = String(row._3 || '').trim();

      if (!playerName || fine === 0) return;

      const normalized = normalizePlayerName(playerName);
      if (!playerMap.has(normalized)) {
        playerMap.set(normalized, {
          name: playerName,
          matchFees: 0,
          fines: 0,
          totalOwed: 0,
          paid: 0,
          balance: 0,
          matchCount: 0,
          fineDetails: [],
          paymentDetails: [],
        });
      }

      const player = playerMap.get(normalized)!;
      player.fines += fine;
      player.fineDetails.push({ date, amount: fine, description });
    });

    // Process bank payments (skip first row if header)
    bankData.forEach((row: any) => {
      const description = String(row.Description || '').trim();
      const payment = parseCurrency(row.In);
      const date = String(row.Date || '').trim();

      if (!description || payment === 0) return;

      // Try to match player name from description
      const extractedName = extractPlayerName(description);

      // Try to find matching player in our map
      let matchedPlayer: PlayerPaymentDetail | undefined;
      let matchedKey = '';

      for (const [key, player] of playerMap.entries()) {
        const playerNameLower = normalizePlayerName(player.name);
        const extractedNameLower = normalizePlayerName(extractedName);

        // Check if extracted name contains player name or vice versa
        if (extractedNameLower.includes(playerNameLower) ||
            playerNameLower.includes(extractedNameLower) ||
            extractedName.toLowerCase().includes(key)) {
          matchedPlayer = player;
          matchedKey = key;
          break;
        }
      }

      if (matchedPlayer) {
        matchedPlayer.paid += payment;
        matchedPlayer.paymentDetails.push({ date, amount: payment });
      }
    });

    // Calculate totals and balances
    for (const player of playerMap.values()) {
      player.totalOwed = player.matchFees + player.fines;
      player.balance = player.totalOwed - player.paid;
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
