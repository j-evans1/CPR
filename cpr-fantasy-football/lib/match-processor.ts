import { fetchCSV } from './data-fetcher';
import { CSV_URLS, MATCH_COLUMNS } from './constants';

export interface MatchPlayerPerformance {
  name: string;
  appearance: number;
  goals: number;
  assists: number;
  cleanSheet: number;
  yellowCard: number;
  redCard: number;
  points: number;
  mom1?: number;
  mom2?: number;
  mom3?: number;
  dod?: number;
}

export interface Match {
  date: string;
  team: 'CPR' | 'CPRA';
  opponent: string;
  score: string;
  cprScore: number;
  opponentScore: number;
  gameweek: string;
  players: MatchPlayerPerformance[];
  isSubmitted?: boolean; // Flag to indicate if this match data comes from captain submission
  matchSummary?: string;
  matchReport?: string;
}

/**
 * Parse score from match description (e.g., "CPR 3v2 Opponent" or "CPRA 4v4 Opponent")
 */
function parseScore(matchDescription: string): { team: 'CPR' | 'CPRA'; cpr: number; opponentScore: number; opponentName: string } {
  // Try to match CPRA first (more specific), then CPR
  const cpraMatch = matchDescription.match(/CPRA\s+(\d+)v(\d+)\s+(.+)/i);
  if (cpraMatch) {
    return {
      team: 'CPRA',
      cpr: parseInt(cpraMatch[1], 10),
      opponentScore: parseInt(cpraMatch[2], 10),
      opponentName: cpraMatch[3].trim(),
    };
  }

  const cprMatch = matchDescription.match(/CPR\s+(\d+)v(\d+)\s+(.+)/i);
  if (cprMatch) {
    return {
      team: 'CPR',
      cpr: parseInt(cprMatch[1], 10),
      opponentScore: parseInt(cprMatch[2], 10),
      opponentName: cprMatch[3].trim(),
    };
  }

  // Default to CPR if can't parse
  return {
    team: 'CPR',
    cpr: 0,
    opponentScore: 0,
    opponentName: matchDescription.replace(/^CPR(A)?\s+/i, '').trim()
  };
}

/**
 * Fetches and processes match data with player performances
 * @returns Array of matches sorted by date (most recent first)
 */
export async function getMatches(): Promise<Match[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchData = await fetchCSV<any>(CSV_URLS.MATCH_DETAILS);

    // Skip first 3 rows (headers)
    const dataRows = matchData.slice(3);

    // Group by match (date + game description)
    const matchesMap = new Map<string, Match>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataRows.forEach((row: any) => {
      const date = String(row[MATCH_COLUMNS.DATE] || '').trim();
      const gameweek = String(row[MATCH_COLUMNS.GAMEWEEK] || '').trim();
      const matchDescription = String(row[MATCH_COLUMNS.GAME] || '').trim();
      const playerName = String(row[MATCH_COLUMNS.PLAYER] || '').trim();

      if (!date || !matchDescription || !playerName) return;

      const matchKey = `${date}-${matchDescription}`;

      // Create match entry if it doesn't exist
      if (!matchesMap.has(matchKey)) {
        const { team, cpr, opponentScore: oppScore, opponentName: oppName } = parseScore(matchDescription);
        matchesMap.set(matchKey, {
          date,
          team,
          opponent: oppName,
          score: `${cpr}-${oppScore}`,
          cprScore: cpr,
          opponentScore: oppScore,
          gameweek,
          players: [],
        });
      }

      const match = matchesMap.get(matchKey)!;

      // Add player performance using column constants
      match.players.push({
        name: playerName,
        appearance: Number(row[MATCH_COLUMNS.APPEARANCE]) || 0,
        goals: Number(row[MATCH_COLUMNS.GOALS]) || 0,
        assists: Number(row[MATCH_COLUMNS.ASSISTS]) || 0,
        cleanSheet: Number(row[MATCH_COLUMNS.CLEAN_SHEET]) || 0,
        yellowCard: Number(row[MATCH_COLUMNS.YELLOW_CARD]) || 0,
        redCard: Number(row[MATCH_COLUMNS.RED_CARD]) || 0,
        points: Number(row[MATCH_COLUMNS.TOTAL_POINTS]) || 0,
      });
    });

    // Convert to array and sort by date (most recent first)
    const matches = Array.from(matchesMap.values());
    matches.sort((a, b) => {
      // Parse dates (format: DD/MM/YYYY)
      const [dayA, monthA, yearA] = a.date.split('/').map(Number);
      const [dayB, monthB, yearB] = b.date.split('/').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateB.getTime() - dateA.getTime();
    });

    return matches;
  } catch (error) {
    console.error('Error processing matches:', error);
    throw error;
  }
}
