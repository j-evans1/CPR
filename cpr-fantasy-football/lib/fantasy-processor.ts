import { fetchCSV } from './data-fetcher';
import { CSV_URLS } from './constants';
import { getPlayerStats } from './data-processor';

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

// Fetch and process fantasy league data
export async function getFantasyLeague(): Promise<FantasyTeam[]> {
  try {
    // Fetch team selection and player stats
    const [teamData, playerStats] = await Promise.all([
      fetchCSV<any>(CSV_URLS.TEAM_SELECTION),
      getPlayerStats(),
    ]);

    // Create a map of player names to their fantasy points
    const playerPointsMap = new Map<string, number>();
    playerStats.forEach((player) => {
      const normalizedName = player.name.toLowerCase().trim();
      playerPointsMap.set(normalizedName, player.fantasyPoints);
    });

    const teams: FantasyTeam[] = [];
    let currentTeam: FantasyTeam | null = null;
    let inPlayerSection = false;

    teamData.forEach((row: any, index: number) => {

      // Check if this row contains "Manager:" which indicates a new team
      if (row._2 && String(row._2).includes('Manager:')) {
        // Save previous team if exists
        if (currentTeam) {
          teams.push(currentTeam);
        }

        // Start new team
        const managerName = String(row._3 || '').trim();
        currentTeam = {
          teamName: managerName + "'s Team",
          managerName: managerName,
          players: [],
          totalPoints: 0,
          rank: 0,
        };
        inPlayerSection = false;
      }
      // Check if this row contains total points and rank
      else if (currentTeam && row._2 === 'Total Points') {
        currentTeam.totalPoints = Number(row._3) || 0;
        currentTeam.rank = Number(row._6) || 0;
        inPlayerSection = true; // Next rows will be players
      }
      // Check if we're in the player section and this row has player data
      else if (currentTeam && inPlayerSection && row._10) {
        // Skip header row
        if (row._10 === 'Player') return;

        const playerName = String(row._10 || '').trim();
        const position = String(row._11 || '').trim();
        const price = Number(row._12) || 0;

        // Get points from our calculated player stats
        const normalizedName = playerName.toLowerCase().trim();
        const points = playerPointsMap.get(normalizedName) || 0;

        if (playerName) {
          currentTeam.players.push({
            name: playerName,
            position,
            price,
            points,
          });
        }
      }
      // Empty row might indicate end of team, but we'll also check for next Manager
    });

    // Don't forget to add the last team
    if (currentTeam) {
      teams.push(currentTeam);
    }

    // Sort teams by rank (ascending) or by total points (descending) if rank is missing
    teams.sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank;
      return b.totalPoints - a.totalPoints;
    });

    return teams;
  } catch (error) {
    console.error('Error processing fantasy league:', error);
    throw error;
  }
}
