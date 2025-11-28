import LeagueTableView from '@/components/LeagueTableView';

export const dynamic = 'force-dynamic';

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

async function getLeagueTables(): Promise<LeagueTable[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/league-table`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch league tables');
  }

  const data = await response.json();
  return data.tables;
}

export default async function LeagueTablePage() {
  let tables: LeagueTable[] = [];
  let error: string | null = null;

  try {
    tables = await getLeagueTables();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load league tables';
    console.error('Error loading league tables:', e);
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">LEAGUE TABLE</h2>
          <p className="text-gray-400 font-light tracking-wide">CPR and CPR A league standings</p>
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
        <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">LEAGUE TABLE</h2>
        <p className="text-gray-400 font-light tracking-wide">
          Current standings from The FA Full-Time
        </p>
      </div>

      {tables.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            No League Data Found
          </h3>
          <p className="text-gray-400 font-light">
            League table data will appear here once available.
          </p>
        </div>
      ) : (
        <LeagueTableView tables={tables} />
      )}
    </div>
  );
}
