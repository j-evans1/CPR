import { getPlayerStats } from '@/lib/data-processor';
import { getMatches, Match } from '@/lib/match-processor';
import { mergeMatchesWithSubmissions } from '@/lib/submission-merger';
import { PlayerStat } from '@/lib/types';
import PlayerStatsTable from '@/components/PlayerStatsTable';
import Snow from '@/components/Snow';

export const dynamic = 'force-dynamic'; // Always fetch fresh data

export default async function Home() {
  let playerStats: PlayerStat[] = [];
  let matches: Match[] = [];
  let error: string | null = null;

  try {
    playerStats = await getPlayerStats();
    const sheetMatches = await getMatches();
    matches = await mergeMatchesWithSubmissions(sheetMatches);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load player stats';
    console.error('Error loading player stats:', e);
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <Snow />
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">PLAYER STATS</h2>
        <p className="text-gray-400 font-light tracking-wide">Season 2025/26 - Updated live from match data</p>
      </div>

      {playerStats.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
          <p className="text-gray-400">No player stats available yet.</p>
        </div>
      ) : (
        <PlayerStatsTable playerStats={playerStats} matches={matches} />
      )}

      <div className="mt-8 text-sm text-gray-500 font-light">
        <p>Total Players: {playerStats.length}</p>
        <p className="mt-1">Data updates automatically on each page load</p>
      </div>
    </div>
  );
}
