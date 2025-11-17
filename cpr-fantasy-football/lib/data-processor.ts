import { PlayerStat } from './types';
import { fetchCSV, parseNumber } from './data-fetcher';
import { CSV_URLS } from './constants';

// Fetch and process player stats
export async function getPlayerStats(): Promise<PlayerStat[]> {
  try {
    // Fetch match data
    const matchData = await fetchCSV<any>(CSV_URLS.MATCH_DETAILS);

    // Skip first 3 rows (headers and empty rows) and process actual data
    const dataRows = matchData.slice(3);

    // Aggregate player stats
    const playerStatsMap = new Map<string, PlayerStat>();

    dataRows.forEach((row: any, index: number) => {
      // Column mapping based on the actual CSV structure
      const playerName = cleanPlayerName(row._5); // Player name is in column _5

      if (!playerName) {
        return; // Skip rows without player name
      }

      // Get or create player stat
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

      // Parse match stats from the correct columns
      const appearance = parseNumber(row._6); // Appearance
      const goals = parseNumber(row._7); // Goals
      const assists = parseNumber(row._8); // Assists
      const yellowCard = parseNumber(row._13); // Yellow Card
      const redCard = parseNumber(row._14); // Red Card
      const cleanSheet = parseNumber(row._17); // Clean Sheet
      const totalPoints = parseNumber(row._29); // Total Points (already calculated)

      // Update stats
      if (appearance > 0) playerStat.appearances += appearance;
      playerStat.goals += goals;
      playerStat.assists += assists;
      if (cleanSheet > 0) playerStat.cleanSheets += cleanSheet;
      if (yellowCard > 0) playerStat.yellowCards += yellowCard;
      if (redCard > 0) playerStat.redCards += redCard;
      playerStat.fantasyPoints += totalPoints;
    });

    // Convert map to array and sort by fantasy points
    return Array.from(playerStatsMap.values()).sort(
      (a, b) => b.fantasyPoints - a.fantasyPoints
    );
  } catch (error) {
    console.error('Error processing player stats:', error);
    throw error;
  }
}

// Clean and normalize player names
function cleanPlayerName(name: any): string {
  if (!name) return '';
  return String(name).trim();
}
