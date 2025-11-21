import { sql } from '@vercel/postgres';

export interface MatchSubmission {
  id: number;
  match_key: string;
  date: string;
  team: 'CPR' | 'CPRA';
  opponent: string;
  cpr_score: number;
  opponent_score: number;
  gameweek: string;
  match_summary?: string;
  match_report?: string;
  submitted_at: Date;
  submitted_by?: string;
}

export interface PlayerSubmission {
  id: number;
  submission_id: number;
  player_name: string;
  appearance: number;
  goals: number;
  assists: number;
  clean_sheet: number;
  yellow_card: number;
  red_card: number;
  mom_1: number;
  mom_2: number;
  mom_3: number;
  dod: number;
}

export interface MomVote {
  id: number;
  match_key: string;
  player_name: string;
  voted_at: Date;
}

export interface MomVoteResult {
  player_name: string;
  vote_count: number;
}

/**
 * Initialize database tables
 */
export async function initDb() {
  // Create match_submissions table
  await sql`
    CREATE TABLE IF NOT EXISTS match_submissions (
      id SERIAL PRIMARY KEY,
      match_key VARCHAR(255) UNIQUE NOT NULL,
      date VARCHAR(20) NOT NULL,
      team VARCHAR(10) NOT NULL,
      opponent VARCHAR(100) NOT NULL,
      cpr_score INTEGER NOT NULL,
      opponent_score INTEGER NOT NULL,
      gameweek VARCHAR(20) NOT NULL,
      match_summary TEXT,
      match_report TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      submitted_by VARCHAR(100)
    )
  `;

  // Add columns to existing table if they don't exist
  try {
    await sql`ALTER TABLE match_submissions ADD COLUMN IF NOT EXISTS match_summary TEXT`;
    await sql`ALTER TABLE match_submissions ADD COLUMN IF NOT EXISTS match_report TEXT`;
  } catch (e) {
    // Columns might already exist, continue
    console.log('Columns already exist or error adding columns:', e);
  }

  // Create player_submissions table
  await sql`
    CREATE TABLE IF NOT EXISTS player_submissions (
      id SERIAL PRIMARY KEY,
      submission_id INTEGER NOT NULL REFERENCES match_submissions(id) ON DELETE CASCADE,
      player_name VARCHAR(100) NOT NULL,
      appearance INTEGER DEFAULT 0,
      goals INTEGER DEFAULT 0,
      assists INTEGER DEFAULT 0,
      clean_sheet INTEGER DEFAULT 0,
      yellow_card INTEGER DEFAULT 0,
      red_card INTEGER DEFAULT 0,
      mom_1 INTEGER DEFAULT 0,
      mom_2 INTEGER DEFAULT 0,
      mom_3 INTEGER DEFAULT 0,
      dod INTEGER DEFAULT 0
    )
  `;

  // Create mom_votes table for anonymous voting
  await sql`
    CREATE TABLE IF NOT EXISTS mom_votes (
      id SERIAL PRIMARY KEY,
      match_key VARCHAR(255) NOT NULL,
      player_name VARCHAR(100) NOT NULL,
      voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create index for faster vote counting
  try {
    await sql`CREATE INDEX IF NOT EXISTS idx_mom_votes_match_key ON mom_votes(match_key)`;
  } catch (e) {
    console.log('Index already exists or error creating index:', e);
  }
}

/**
 * Get all match submissions with their player data
 */
export async function getMatchSubmissions() {
  const matchesResult = await sql<MatchSubmission>`
    SELECT * FROM match_submissions ORDER BY date DESC
  `;

  const submissions = await Promise.all(
    matchesResult.rows.map(async (match) => {
      const playersResult = await sql<PlayerSubmission>`
        SELECT * FROM player_submissions WHERE submission_id = ${match.id}
      `;
      return {
        match,
        players: playersResult.rows,
      };
    })
  );

  return submissions;
}

/**
 * Get submission for a specific match
 */
export async function getMatchSubmission(matchKey: string) {
  const matchResult = await sql<MatchSubmission>`
    SELECT * FROM match_submissions WHERE match_key = ${matchKey}
  `;

  if (matchResult.rows.length === 0) {
    return null;
  }

  const match = matchResult.rows[0];
  const playersResult = await sql<PlayerSubmission>`
    SELECT * FROM player_submissions WHERE submission_id = ${match.id}
  `;

  return {
    match,
    players: playersResult.rows,
  };
}

/**
 * Create or update a match submission
 */
export async function upsertMatchSubmission(
  matchKey: string,
  matchData: {
    date: string;
    team: 'CPR' | 'CPRA';
    opponent: string;
    cprScore: number;
    opponentScore: number;
    gameweek: string;
    matchSummary?: string;
    submittedBy?: string;
  },
  players: Array<{
    name: string;
    appearance: number;
    goals: number;
    assists: number;
    cleanSheet: number;
    yellowCard: number;
    redCard: number;
    mom1: number;
    mom2: number;
    mom3: number;
    dod: number;
  }>
) {
  // Check if submission already exists
  const existing = await sql<MatchSubmission>`
    SELECT id FROM match_submissions WHERE match_key = ${matchKey}
  `;

  let submissionId: number;

  if (existing.rows.length > 0) {
    // Update existing submission
    submissionId = existing.rows[0].id;
    await sql`
      UPDATE match_submissions
      SET date = ${matchData.date},
          team = ${matchData.team},
          opponent = ${matchData.opponent},
          cpr_score = ${matchData.cprScore},
          opponent_score = ${matchData.opponentScore},
          gameweek = ${matchData.gameweek},
          match_summary = ${matchData.matchSummary || null},
          submitted_at = CURRENT_TIMESTAMP,
          submitted_by = ${matchData.submittedBy || null}
      WHERE id = ${submissionId}
    `;

    // Delete old player data
    await sql`
      DELETE FROM player_submissions WHERE submission_id = ${submissionId}
    `;
  } else {
    // Insert new submission
    const result = await sql<{ id: number }>`
      INSERT INTO match_submissions (match_key, date, team, opponent, cpr_score, opponent_score, gameweek, match_summary, submitted_by)
      VALUES (${matchKey}, ${matchData.date}, ${matchData.team}, ${matchData.opponent}, ${matchData.cprScore}, ${matchData.opponentScore}, ${matchData.gameweek}, ${matchData.matchSummary || null}, ${matchData.submittedBy || null})
      RETURNING id
    `;
    submissionId = result.rows[0].id;
  }

  // Insert player data
  for (const player of players) {
    await sql`
      INSERT INTO player_submissions (
        submission_id, player_name, appearance, goals, assists, clean_sheet,
        yellow_card, red_card, mom_1, mom_2, mom_3, dod
      )
      VALUES (
        ${submissionId}, ${player.name}, ${player.appearance}, ${player.goals}, ${player.assists}, ${player.cleanSheet},
        ${player.yellowCard}, ${player.redCard}, ${player.mom1}, ${player.mom2}, ${player.mom3}, ${player.dod}
      )
    `;
  }

  return submissionId;
}

/**
 * Delete a match submission and its player data
 */
export async function deleteMatchSubmission(matchKey: string) {
  console.log('Deleting match submission with key:', matchKey);

  // First, check if the submission exists
  const exists = await submissionExists(matchKey);
  if (!exists) {
    console.log('No submission found with key:', matchKey);
    throw new Error('Submission not found');
  }

  // Delete from match_submissions (player_submissions will be deleted automatically via CASCADE)
  const result = await sql`
    DELETE FROM match_submissions WHERE match_key = ${matchKey} RETURNING id
  `;

  if (result.rowCount === 0) {
    console.log('Delete operation returned 0 rows for key:', matchKey);
    throw new Error('Failed to delete submission');
  }

  console.log('Successfully deleted match submission:', result.rows[0].id);
}

/**
 * Check if a submission exists for a match
 */
export async function submissionExists(matchKey: string): Promise<boolean> {
  const result = await sql<{ count: number }>`
    SELECT COUNT(*) as count FROM match_submissions WHERE match_key = ${matchKey}
  `;
  return result.rows[0].count > 0;
}

/**
 * Update match report for a submission
 */
export async function updateMatchReport(matchKey: string, matchReport: string) {
  await sql`
    UPDATE match_submissions
    SET match_report = ${matchReport}
    WHERE match_key = ${matchKey}
  `;
}

/**
 * Submit a Man of the Match vote
 */
export async function submitMomVote(matchKey: string, playerName: string) {
  await sql`
    INSERT INTO mom_votes (match_key, player_name)
    VALUES (${matchKey}, ${playerName})
  `;
}

/**
 * Get MoM vote results for a specific match
 */
export async function getMomVoteResults(matchKey: string): Promise<MomVoteResult[]> {
  const result = await sql<MomVoteResult>`
    SELECT player_name, COUNT(*) as vote_count
    FROM mom_votes
    WHERE match_key = ${matchKey}
    GROUP BY player_name
    ORDER BY vote_count DESC, player_name ASC
  `;

  return result.rows;
}

/**
 * Get total number of votes for a match
 */
export async function getMomVoteCount(matchKey: string): Promise<number> {
  const result = await sql<{ count: number }>`
    SELECT COUNT(*) as count
    FROM mom_votes
    WHERE match_key = ${matchKey}
  `;
  return result.rows[0].count;
}

/**
 * Calculate MoM winners using golf leaderboard scoring
 * If tied for 1st, next place is 3rd (not 2nd)
 */
export async function calculateMomWinners(matchKey: string): Promise<{
  mom1: string[];
  mom2: string[];
  mom3: string[];
}> {
  const results = await getMomVoteResults(matchKey);

  if (results.length === 0) {
    return { mom1: [], mom2: [], mom3: [] };
  }

  const mom1: string[] = [];
  const mom2: string[] = [];
  const mom3: string[] = [];

  // Group players by vote count
  const voteGroups: { [key: number]: string[] } = {};
  results.forEach(result => {
    const votes = Number(result.vote_count);
    if (!voteGroups[votes]) {
      voteGroups[votes] = [];
    }
    voteGroups[votes].push(result.player_name);
  });

  // Get unique vote counts in descending order
  const voteCounts = Object.keys(voteGroups)
    .map(Number)
    .sort((a, b) => b - a);

  // Apply golf scoring
  let position = 1;
  for (const voteCount of voteCounts) {
    const players = voteGroups[voteCount];

    if (position === 1) {
      mom1.push(...players);
      position += players.length; // If 2 tied for 1st, next position is 3
    } else if (position === 2) {
      mom2.push(...players);
      position += players.length;
    } else if (position === 3) {
      mom3.push(...players);
      break; // We only care about top 3 positions
    } else {
      break; // Past 3rd place
    }
  }

  return { mom1, mom2, mom3 };
}
