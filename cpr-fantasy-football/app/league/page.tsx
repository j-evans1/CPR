import { getFantasyLeague, FantasyTeam } from '@/lib/fantasy-processor';
import TeamCard from '@/components/TeamCard';

export const dynamic = 'force-dynamic';

export default async function LeaguePage() {
  let teams: FantasyTeam[] = [];
  let error: string | null = null;

  try {
    teams = await getFantasyLeague();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load fantasy league';
    console.error('Error loading fantasy league:', e);
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-navy mb-2">Fantasy League</h2>
          <p className="text-gray-600">Team standings and fantasy points</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-2">Fantasy League</h2>
        <p className="text-gray-600">
          Season 2025/26 standings - Tap a team to see their roster
        </p>
      </div>

      {teams.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Teams Found
          </h3>
          <p className="text-gray-600">
            Fantasy team data will appear here once teams are set up.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-navy">{teams.length}</div>
              <div className="text-sm text-gray-600 mt-1">Teams</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-navy">
                {Math.max(...teams.map(t => t.totalPoints))}
              </div>
              <div className="text-sm text-gray-600 mt-1">Top Score</div>
            </div>
          </div>

          {/* Team Cards */}
          <div className="space-y-2">
            {teams.map((team, index) => (
              <TeamCard key={team.managerName} team={team} index={index} />
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>Tap any team to view their full roster and player points</p>
            <p className="mt-1">Data updates automatically on page refresh</p>
          </div>
        </>
      )}
    </div>
  );
}
