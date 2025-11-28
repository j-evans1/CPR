export default function LeagueTablePage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">LEAGUE TABLE</h2>
        <p className="text-gray-400 font-light tracking-wide">
          Current standings - South Division 2
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-semibold text-gray-100 mb-4">
            View Live League Table
          </h3>
          <p className="text-gray-400 font-light mb-6 max-w-2xl mx-auto">
            Due to security restrictions, the league table cannot be embedded directly.
            Click the button below to view the latest standings on The FA Full-Time website.
          </p>

          <a
            href="https://fulltime.thefa.com/table.html?divisionseason=297360682"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-colors text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View League Table on FA Full-Time
          </a>

          <p className="text-sm text-gray-500 mt-6">
            Opens in a new tab
          </p>
        </div>

        <div className="border-t border-slate-700 pt-6 mt-6">
          <h4 className="text-lg font-semibold text-gray-200 mb-4 text-center">Quick Info</h4>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-sm text-gray-400 uppercase mb-1">Competition</div>
              <div className="text-gray-100 font-semibold">South Division 2</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-sm text-gray-400 uppercase mb-1">Season</div>
              <div className="text-gray-100 font-semibold">2025/26</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-sm text-gray-400 uppercase mb-1">Teams</div>
              <div className="text-gray-100 font-semibold">10</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300">
            <p className="font-semibold mb-1">Why can't I see the table here?</p>
            <p className="text-blue-200/80">
              The FA Full-Time website prevents embedding their league tables on external sites for security reasons.
              This is a standard security measure. Click the button above to view the latest standings directly on their official website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
