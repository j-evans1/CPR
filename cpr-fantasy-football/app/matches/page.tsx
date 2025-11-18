import { getMatches, Match } from '@/lib/match-processor';
import MatchesView from '@/components/MatchesView';

export const dynamic = 'force-dynamic';

export default async function MatchesPage() {
  let matches: Match[] = [];
  let error: string | null = null;

  try {
    matches = await getMatches();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load matches';
    console.error('Error loading matches:', e);
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">MATCH RESULTS</h2>
          <p className="text-gray-400 font-light tracking-wide">All matches from the 2025/26 season</p>
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-700 font-light">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">MATCH RESULTS</h2>
        <p className="text-gray-400 font-light tracking-wide">
          Season 2025/26 - Filter by team and tap matches to see player performances
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">⚽</div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            No Matches Found
          </h3>
          <p className="text-gray-400 font-light">
            Match results will appear here once games are played.
          </p>
        </div>
      ) : (
        <MatchesView matches={matches} />
      )}
    </div>
  );
}
