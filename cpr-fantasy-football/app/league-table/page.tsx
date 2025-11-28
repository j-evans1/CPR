import { getLeagueTableData, LeagueTableData, LeagueTableRow } from '@/lib/league-scraper';

export const dynamic = 'force-dynamic';

export default async function LeagueTablePage() {
  let data: LeagueTableData | null = null;

  try {
    data = await getLeagueTableData();
  } catch (error) {
    console.error('Error fetching league table:', error);
  }

  if (!data) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">LEAGUE TABLE</h2>
          <p className="text-gray-400 font-light tracking-wide">Current standings from The FA Full-Time</p>
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-700 font-light">Failed to load league table</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">LEAGUE TABLE</h2>
        <p className="text-gray-400 font-light tracking-wide">{data.name}</p>
        <p className="text-sm text-gray-500 mt-2">
          Last updated: {new Date(data.lastUpdated).toLocaleString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {data.rows.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            No League Data Available
          </h3>
          <p className="text-gray-400 font-light">
            League table data is currently unavailable.
          </p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Pos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">
                    P
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">
                    W
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">
                    D
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">
                    L
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">
                    GF
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">
                    GA
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">
                    GD
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {data.rows.map((row, index) => (
                  <tr
                    key={row.position}
                    className={`hover:bg-slate-700/50 transition-colors ${
                      row.team.includes('Clissold Park Rangers') ? 'bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-200">
                      {row.position}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-100">
                      {row.team}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-300">
                      {row.played}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-300">
                      {row.won}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-300">
                      {row.drawn}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-300">
                      {row.lost}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-300">
                      {row.goalsFor}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-300">
                      {row.goalsAgainst}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm text-center font-semibold ${
                      row.goalDifference > 0 ? 'text-green-400' :
                      row.goalDifference < 0 ? 'text-red-400' : 'text-gray-300'
                    }`}>
                      {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-100">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-700">
            {data.rows.map((row) => (
              <div
                key={row.position}
                className={`p-4 ${
                  row.team.includes('Clissold Park Rangers') ? 'bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-gray-200">{row.position}</span>
                    <span className="text-base font-medium text-gray-100">{row.team}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-100">{row.points}</span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center text-sm">
                  <div>
                    <div className="text-xs text-gray-400 uppercase">P</div>
                    <div className="text-gray-200 font-medium">{row.played}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase">W</div>
                    <div className="text-gray-200 font-medium">{row.won}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase">D</div>
                    <div className="text-gray-200 font-medium">{row.drawn}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase">L</div>
                    <div className="text-gray-200 font-medium">{row.lost}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase">GD</div>
                    <div className={`font-semibold ${
                      row.goalDifference > 0 ? 'text-green-400' :
                      row.goalDifference < 0 ? 'text-red-400' : 'text-gray-200'
                    }`}>
                      {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
