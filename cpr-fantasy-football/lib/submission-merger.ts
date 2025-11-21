import { Match, MatchPlayerPerformance } from './match-processor';
import { getMatchSubmission } from './db';

/**
 * Generate match key from match data (same format used for grouping)
 */
export function generateMatchKey(date: string, team: string, opponent: string): string {
  return `${date}-${team} ${opponent}`;
}

/**
 * Merge submitted data with matches from Google Sheets
 * Submitted data takes priority when available
 */
export async function mergeMatchesWithSubmissions(matches: Match[]): Promise<Match[]> {
  const mergedMatches = await Promise.all(
    matches.map(async (match) => {
      // Generate match key (matching how it's stored in DB)
      const matchDescription = `${match.team} ${match.score} ${match.opponent}`;
      const matchKey = `${match.date}-${matchDescription}`;

      // Try to get submission
      const submission = await getMatchSubmission(matchKey);

      if (!submission) {
        // No submission, return original match
        return match;
      }

      // We have a submission! Convert to Match format
      const submittedPlayers: MatchPlayerPerformance[] = submission.players.map((p) => ({
        name: p.player_name,
        appearance: p.appearance,
        goals: p.goals,
        assists: p.assists,
        cleanSheet: p.clean_sheet,
        yellowCard: p.yellow_card,
        redCard: p.red_card,
        mom1: p.mom_1,
        mom2: p.mom_2,
        mom3: p.mom_3,
        dod: p.dod,
        // Points are NOT calculated yet - show as 0 or TBD
        points: 0,
      }));

      // Return match with submitted data
      return {
        date: submission.match.date,
        team: submission.match.team,
        opponent: submission.match.opponent,
        score: `${submission.match.cpr_score}-${submission.match.opponent_score}`,
        cprScore: submission.match.cpr_score,
        opponentScore: submission.match.opponent_score,
        gameweek: submission.match.gameweek,
        players: submittedPlayers,
        isSubmitted: true, // Flag to indicate this is submitted data
        matchSummary: submission.match.match_summary,
        matchReport: submission.match.match_report,
      } as Match & { isSubmitted: boolean; matchSummary?: string; matchReport?: string };
    })
  );

  return mergedMatches;
}
