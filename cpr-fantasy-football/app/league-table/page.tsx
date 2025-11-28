import LeagueTableView from '@/components/LeagueTableView';
import { getLatestLeagueTableData, getLeagueTableCacheStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LeagueTablePage() {
  let tables: any[] = [];
  let error: string | null = null;
  let cacheStatus: { lastScrapedAt: Date; success: boolean } | null = null;

  try {
    tables = await getLatestLeagueTableData();
    cacheStatus = await getLeagueTableCacheStatus();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load league tables';
    console.error('Error loading league tables from cache:', e);
  }

  // Check if cache is stale (older than 7 days)
  const isStale = cacheStatus &&
    (Date.now() - new Date(cacheStatus.lastScrapedAt).getTime()) > 7 * 24 * 60 * 60 * 1000;

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
        {cacheStatus && (
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date(cacheStatus.lastScrapedAt).toLocaleString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {isStale && <span className="text-yellow-500 ml-2">(Data may be outdated)</span>}
          </p>
        )}
      </div>

      {tables.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            No League Data Available
          </h3>
          <p className="text-gray-400 font-light">
            League table data will be updated automatically on Saturdays at 4pm and 6pm.
          </p>
        </div>
      ) : (
        <LeagueTableView tables={tables} />
      )}
    </div>
  );
}
