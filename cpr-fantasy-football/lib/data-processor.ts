import { PlayerStat } from './types';
import { fetchCSV, parseNumber } from './data-fetcher';
import { CSV_URLS, MATCH_COLUMNS } from './constants';

/**
 * Fetches and aggregates player statistics from match data and player data
 * Includes Misc-Points from Player Data CSV for manual adjustments
 * @returns Array of player stats sorted by fantasy points (highest first)
 */
export async function getPlayerStats(): Promise<PlayerStat[]> {
  try {
    // Fetch both match data and player data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [matchData, playerData] = await Promise.all<any>([
      fetchCSV(CSV_URLS.MATCH_DETAILS),
      fetchCSV(CSV_URLS.PLAYER_DATA),
    ]);

    // Skip first 3 rows (headers and empty rows) and process actual match data
    const dataRows = matchData.slice(3);

    const playerStatsMap = new Map<string, PlayerStat>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataRows.forEach((row: any) => {
      const playerName = cleanPlayerName(row[MATCH_COLUMNS.PLAYER]);

      if (!playerName) return; // Skip rows without player name

      // Get or create player stat entry
      let playerStat = playerStatsMap.get(playerName);
      if (!playerStat) {
        playerStat = {
          name: playerName,
          appearances: 0,
          goals: 0,
          assists: 0,
          cleanSheets: 0,
          yellowCards: 0,
          redCards: 0,
          fantasyPoints: 0,
        };
        playerStatsMap.set(playerName, playerStat);
      }

      // Parse match stats using column constants
      const appearance = parseNumber(row[MATCH_COLUMNS.APPEARANCE]);
      const goals = parseNumber(row[MATCH_COLUMNS.GOALS]);
      const assists = parseNumber(row[MATCH_COLUMNS.ASSISTS]);
      const yellowCard = parseNumber(row[MATCH_COLUMNS.YELLOW_CARD]);
      const redCard = parseNumber(row[MATCH_COLUMNS.RED_CARD]);
      const cleanSheet = parseNumber(row[MATCH_COLUMNS.CLEAN_SHEET]);
      const totalPoints = parseNumber(row[MATCH_COLUMNS.TOTAL_POINTS]);

      // Aggregate stats
      if (appearance > 0) playerStat.appearances += appearance;
      playerStat.goals += goals;
      playerStat.assists += assists;
      if (cleanSheet > 0) playerStat.cleanSheets += cleanSheet;
      if (yellowCard > 0) playerStat.yellowCards += yellowCard;
      if (redCard > 0) playerStat.redCards += redCard;
      playerStat.fantasyPoints += totalPoints;
    });

    // Add Misc-Points from Player Data CSV
    // This allows manual adjustments to be reflected in fantasy points
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playerData.forEach((row: any) => {
      const playerName = cleanPlayerName(row.Player);
      if (!playerName) return;

      const playerStat = playerStatsMap.get(playerName);
      if (playerStat) {
        const miscPoints = parseNumber(row['Misc-Points']);
        playerStat.fantasyPoints += miscPoints;
      }
    });

    // Convert to array and sort by fantasy points (descending)
    return Array.from(playerStatsMap.values()).sort(
      (a, b) => b.fantasyPoints - a.fantasyPoints
    );
  } catch (error) {
    console.error('Error processing player stats:', error);
    throw error;
  }
}

/**
 * Clean and normalize player names
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanPlayerName(name: any): string {
  if (!name) return '';
  return String(name).trim();
}
