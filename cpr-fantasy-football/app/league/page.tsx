export default function LeaguePage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-2">Fantasy League</h2>
        <p className="text-gray-600">Team standings and fantasy points - Coming soon!</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Fantasy League Standings
        </h3>
        <p className="text-gray-600 mb-4">
          See which manager is leading the fantasy league this season.
        </p>
        <div className="text-sm text-gray-500">
          This page will show team rosters, total points, and league rankings.
        </div>
      </div>
    </div>
  );
}
