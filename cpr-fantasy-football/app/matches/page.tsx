import { getMatches, Match } from '@/lib/match-processor';
import { mergeMatchesWithSubmissions } from '@/lib/submission-merger';
import MatchesView from '@/components/MatchesView';

export const dynamic = 'force-dynamic';

export default async function MatchesPage() {
  let matches: Match[] = [];
  let error: string | null = null;

  try {
    const sheetMatches = await getMatches();
    matches = await mergeMatchesWithSubmissions(sheetMatches);
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

      {/* League Tables */}
      <div className="mb-8 grid md:grid-cols-2 gap-4">
        <a
          href="https://fulltime.thefa.com/table.html?divisionseason=297360682"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-4 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">📊</div>
            <div>
              <div className="font-semibold text-gray-100 group-hover:text-white">CPR League Table</div>
              <div className="text-sm text-gray-400">South Division 2</div>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        <a
          href="https://fulltime.thefa.com/table.html?divisionseason=964182765"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-4 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">📊</div>
            <div>
              <div className="font-semibold text-gray-100 group-hover:text-white">CPR A League Table</div>
              <div className="text-sm text-gray-400">South Division 2</div>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
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
