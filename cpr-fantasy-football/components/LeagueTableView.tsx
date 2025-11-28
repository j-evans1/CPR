'use client';

interface LeagueTableRow {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface LeagueTable {
  id: string;
  name: string;
  rows: LeagueTableRow[];
}

interface LeagueTableViewProps {
  tables: LeagueTable[];
}

export default function LeagueTableView({ tables }: LeagueTableViewProps) {
  return (
    <div className="space-y-8">
      {tables.map((table) => (
        <div key={table.id} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-700">
            <h3 className="text-xl font-bold text-slate-100 tracking-tight">
              {table.name}
            </h3>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-3 py-3 text-center font-semibold w-12">#</th>
                  <th className="px-3 py-3 text-left font-semibold">Team</th>
                  <th className="px-3 py-3 text-center font-semibold w-12">P</th>
                  <th className="px-3 py-3 text-center font-semibold w-12">W</th>
                  <th className="px-3 py-3 text-center font-semibold w-12">D</th>
                  <th className="px-3 py-3 text-center font-semibold w-12">L</th>
                  <th className="px-3 py-3 text-center font-semibold w-12">GF</th>
                  <th className="px-3 py-3 text-center font-semibold w-12">GA</th>
                  <th className="px-3 py-3 text-center font-semibold w-12">GD</th>
                  <th className="px-3 py-3 text-center font-semibold w-16 bg-slate-900/70">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {table.rows.map((row, index) => {
                  // Highlight CPR and CPR A teams
                  const isCPRTeam = row.team.toLowerCase().includes('cpr');
                  const isFirst = index === 0;

                  return (
                    <tr
                      key={row.position}
                      className={`
                        ${isCPRTeam ? 'bg-blue-900/20' : ''}
                        ${isFirst ? 'bg-yellow-900/10' : ''}
                        hover:bg-slate-700/30 transition-colors
                      `}
                    >
                      <td className="px-3 py-3 text-center font-semibold text-gray-300 tabular-nums">
                        {row.position}
                      </td>
                      <td className={`px-3 py-3 font-medium ${isCPRTeam ? 'text-blue-300' : 'text-gray-200'}`}>
                        {row.team}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-300 tabular-nums">
                        {row.played}
                      </td>
                      <td className="px-3 py-3 text-center text-green-400 tabular-nums">
                        {row.won}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-400 tabular-nums">
                        {row.drawn}
                      </td>
                      <td className="px-3 py-3 text-center text-red-400 tabular-nums">
                        {row.lost}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-300 tabular-nums">
                        {row.goalsFor}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-300 tabular-nums">
                        {row.goalsAgainst}
                      </td>
                      <td className={`px-3 py-3 text-center tabular-nums font-medium ${
                        row.goalDifference > 0 ? 'text-green-400' :
                        row.goalDifference < 0 ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-white tabular-nums bg-slate-900/50">
                        {row.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Legend */}
          <div className="px-4 py-3 bg-slate-900/30 border-t border-slate-700">
            <div className="text-xs text-gray-500 font-light space-y-1">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span><span className="font-semibold text-gray-400">P</span> - Played</span>
                <span><span className="font-semibold text-gray-400">W</span> - Won</span>
                <span><span className="font-semibold text-gray-400">D</span> - Drawn</span>
                <span><span className="font-semibold text-gray-400">L</span> - Lost</span>
                <span><span className="font-semibold text-gray-400">GF</span> - Goals For</span>
                <span><span className="font-semibold text-gray-400">GA</span> - Goals Against</span>
                <span><span className="font-semibold text-gray-400">GD</span> - Goal Difference</span>
                <span><span className="font-semibold text-gray-400">Pts</span> - Points</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Footer Info */}
      <div className="text-sm text-gray-500 text-center font-light space-y-1">
        <p>Data sourced from The FA Full-Time</p>
        <p>Updates automatically on page refresh</p>
      </div>
    </div>
  );
}
