import { fetchCSV } from './data-fetcher';
import { CSV_URLS } from './constants';

export interface FantasyTeamPlayer {
  name: string;
  position: string;
  price: number;
  points: number;
}

export interface FantasyTeam {
  teamName: string;
  managerName: string;
  players: FantasyTeamPlayer[];
  totalPoints: number;
  rank: number;
}

/**
 * Fetches and processes fantasy league team data
 * @returns Array of fantasy teams sorted by total points (highest first)
 */
export async function getFantasyLeague(): Promise<FantasyTeam[]> {
  try {
    // Fetch team selection data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teamData = await fetchCSV<any>(CSV_URLS.TEAM_SELECTION);

    // The CSV structure is: each row is a player on a team
    // Columns: Team Name, Manager, Players, Price, Position, ..., Total-Points, Team-Points
    const teamsMap = new Map<string, FantasyTeam>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    teamData.forEach((row: any) => {
      const teamName = String(row['Team Name'] || '').trim();
      const managerName = String(row['Manager'] || '').trim();
      const playerName = String(row['Players'] || '').trim();
      const position = String(row['Position'] || '').trim();
      const price = Number(row['Price']) || 0;
      const playerPoints = Number(row['Total-Points']) || 0;
      const teamPoints = Number(row['Team-Points']) || 0;

      // Skip rows without team name
      if (!teamName || !managerName) return;

      // Get or create team
      if (!teamsMap.has(teamName)) {
        teamsMap.set(teamName, {
          teamName,
          managerName,
          players: [],
          totalPoints: teamPoints,
          rank: 0, // Will be calculated after sorting
        });
      }

      const team = teamsMap.get(teamName)!;

      // Add player if we have player data
      if (playerName) {
        team.players.push({
          name: playerName,
          position,
          price,
          points: playerPoints,
        });
      }
    });

    // Calculate total points from players and convert to array
    const teams = Array.from(teamsMap.values());

    // Calculate each team's total points from their players
    teams.forEach(team => {
      team.totalPoints = team.players.reduce((sum, player) => sum + player.points, 0);
    });

    // Sort by total points
    teams.sort((a, b) => b.totalPoints - a.totalPoints);

    // Assign ranks
    teams.forEach((team, index) => {
      team.rank = index + 1;
    });

    return teams;
  } catch (error) {
    console.error('Error processing fantasy league:', error);
    throw error;
  }
}
