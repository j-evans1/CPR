export default function LeagueTablePage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">LEAGUE TABLE</h2>
        <p className="text-gray-400 font-light tracking-wide">
          Current standings from The FA Full-Time
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Live data from The FA Full-Time system
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <iframe
          src="https://fulltime.thefa.com/table.html?divisionseason=297360682"
          className="w-full h-[800px] md:h-[600px]"
          title="CPR League Table"
          style={{ border: 'none' }}
        />
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>
          Table refreshes automatically when you reload the page.
          Data provided by{' '}
          <a
            href="https://fulltime.thefa.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            The FA Full-Time
          </a>
        </p>
      </div>
    </div>
  );
}
