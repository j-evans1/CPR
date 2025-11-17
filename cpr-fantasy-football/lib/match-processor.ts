import { fetchCSV } from './data-fetcher';
import { CSV_URLS } from './constants';

export interface MatchPlayerPerformance {
  name: string;
  appearance: number;
  goals: number;
  assists: number;
  cleanSheet: number;
  yellowCard: number;
  redCard: number;
  points: number;
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
}

// Parse score from match description (e.g., "CPR 3v2 Opponent" or "CPRA 4v4 Opponent")
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

// Fetch and process match data
export async function getMatches(): Promise<Match[]> {
  try {
    const matchData = await fetchCSV<any>(CSV_URLS.MATCH_DETAILS);

    // Skip first 3 rows (headers)
    const dataRows = matchData.slice(3);

    // Group by match (date + game)
    const matchesMap = new Map<string, Match>();

    dataRows.forEach((row: any) => {
      const date = String(row._1 || '').trim();
      const gameweek = String(row._3 || '').trim();
      const matchDescription = String(row._4 || '').trim();
      const playerName = String(row._5 || '').trim();

      if (!date || !matchDescription || !playerName) return;

      const matchKey = `${date}-${matchDescription}`;

      // Create match if it doesn't exist
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

      // Add player performance
      match.players.push({
        name: playerName,
        appearance: Number(row._6) || 0,
        goals: Number(row._7) || 0,
        assists: Number(row._8) || 0,
        cleanSheet: Number(row._16) || 0,
        yellowCard: Number(row._13) || 0,
        redCard: Number(row._14) || 0,
        points: Number(row._28) || 0,
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
