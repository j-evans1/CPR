import { getPlayerStats } from '@/lib/data-processor';
import { PlayerStat } from '@/lib/types';

export const dynamic = 'force-dynamic'; // Always fetch fresh data

export default async function Home() {
  let playerStats: PlayerStat[] = [];
  let error: string | null = null;

  try {
    playerStats = await getPlayerStats();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load player stats';
    console.error('Error loading player stats:', e);
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Player Stats Leaderboard</h2>
        <p className="text-gray-600">Season 2025/26 - Updated live from match data</p>
      </div>

      {playerStats.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">No player stats available yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold sticky left-0 z-10 bg-navy">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold sticky left-[72px] z-10 bg-navy">Player</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Apps</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Goals</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Assists</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Clean Sheets</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">MoM 1</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">MoM 2</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">MoM 3</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">DoD</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Yellow Cards</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Red Cards</th>
                <th className="px-6 py-4 text-center text-sm font-semibold bg-navy/90">Fantasy Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {playerStats.map((player, index) => (
                <tr
                  key={player.name}
                  className={`hover:bg-gray-50 transition-colors ${
                    index < 3 ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 z-10 bg-inherit">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-[72px] z-10 bg-inherit">
                    {player.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {player.appearances}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {player.goals}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {player.assists}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {player.cleanSheets}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {player.mom1}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {player.mom2}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {player.mom3}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {player.dod}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {player.yellowCards}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {player.redCards}
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-navy bg-gray-50">
                    {player.fantasyPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        <p>Total Players: {playerStats.length}</p>
        <p className="mt-1">Data updates automatically on each page load</p>
      </div>
    </div>
  );
}
