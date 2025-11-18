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
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">PLAYER STATS</h2>
        <p className="text-gray-400 font-light tracking-wide">Season 2025/26 - Updated live from match data</p>
      </div>

      {playerStats.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
          <p className="text-gray-400">No player stats available yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-slate-700">
          <table className="min-w-full bg-slate-800">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider sticky left-0 z-10 bg-navy">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider sticky left-[72px] z-10 bg-navy">Player</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Apps</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Goals</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Assists</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Clean Sheets</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">MoM 1</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">MoM 2</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">MoM 3</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">DoD</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Yellow Cards</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Red Cards</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider bg-navy/90">Fantasy Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {playerStats.map((player, index) => (
                <tr
                  key={player.name}
                  className={`hover:bg-slate-700 transition-colors ${
                    index < 3 ? 'bg-yellow-900/20' : ''
                  }`}
                >
                  <td className={`px-6 py-4 text-lg font-bold text-gray-100 sticky left-0 z-10 ${
                    index < 3 ? 'bg-yellow-900/20' : 'bg-slate-800'
                  }`}>
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && index + 1}
                  </td>
                  <td className={`px-6 py-4 text-base font-semibold text-gray-100 sticky left-[72px] z-10 tracking-wide ${
                    index < 3 ? 'bg-yellow-900/20' : 'bg-slate-800'
                  }`}>
                    {player.name}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.appearances}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.goals}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.assists}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.cleanSheets}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.mom1}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.mom2}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.mom3}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.dod}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.yellowCards}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.redCards}
                  </td>
                  <td className="px-6 py-4 text-xl text-center font-bold text-navy bg-gray-50 tabular-nums">
                    {player.fantasyPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-500 font-light">
        <p>Total Players: {playerStats.length}</p>
        <p className="mt-1">Data updates automatically on each page load</p>
      </div>
    </div>
  );
}
