import { getMatches, Match } from '@/lib/match-processor';
import MatchCard from '@/components/MatchCard';

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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-navy mb-2">Match Results</h2>
          <p className="text-gray-600">All matches from the 2025/26 season</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const wins = matches.filter(m => m.cprScore > m.opponentScore).length;
  const draws = matches.filter(m => m.cprScore === m.opponentScore).length;
  const losses = matches.filter(m => m.cprScore < m.opponentScore).length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-2">Match Results</h2>
        <p className="text-gray-600">
          Season 2025/26 - Tap a match to see player performances
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">⚽</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Matches Found
          </h3>
          <p className="text-gray-600">
            Match results will appear here once games are played.
          </p>
        </div>
      ) : (
        <>
          {/* Season Stats Summary */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-navy">{matches.length}</div>
              <div className="text-xs text-gray-600 mt-1">Played</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{wins}</div>
              <div className="text-xs text-gray-600 mt-1">Wins</div>
            </div>
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-700">{draws}</div>
              <div className="text-xs text-gray-600 mt-1">Draws</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-700">{losses}</div>
              <div className="text-xs text-gray-600 mt-1">Losses</div>
            </div>
          </div>

          {/* Match Cards */}
          <div className="space-y-3">
            {matches.map((match, index) => (
              <MatchCard key={`${match.date}-${match.opponent}-${index}`} match={match} />
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>Tap any match to view player performances and stats</p>
            <p className="mt-1">Data updates automatically on page refresh</p>
          </div>
        </>
      )}
    </div>
  );
}
