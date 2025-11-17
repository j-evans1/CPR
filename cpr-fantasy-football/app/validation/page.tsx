import { fetchCSV } from '@/lib/data-fetcher';
import { CSV_URLS } from '@/lib/constants';
import { getPlayerStats } from '@/lib/data-processor';
import { getPlayerPayments, PlayerPaymentDetail } from '@/lib/payment-processor';
import { PlayerStat } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface ValidationResult {
  playerName: string;
  field: string;
  appValue: number | string;
  spreadsheetValue: number | string;
  match: boolean;
}

export default async function ValidationPage() {
  const results: ValidationResult[] = [];
  let error: string | null = null;

  try {
    // Fetch data from app processors
    const [playerStats, playerPayments, playerData] = await Promise.all([
      getPlayerStats(),
      getPlayerPayments(),
      fetchCSV(CSV_URLS.PLAYER_DATA),
    ]);

    // Create lookup maps
    const statsMap = new Map<string, PlayerStat>(
      playerStats.map(p => [p.name.toLowerCase().trim(), p])
    );
    const paymentsMap = new Map<string, PlayerPaymentDetail>(
      playerPayments.map(p => [p.name.toLowerCase().trim(), p])
    );

    // Validate each player from the spreadsheet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playerData.forEach((row: any) => {
      const playerName = String(row.Player || '').trim();
      if (!playerName) return;

      const normalized = playerName.toLowerCase().trim();
      const appStats = statsMap.get(normalized);
      const appPayment = paymentsMap.get(normalized);

      // Validate fantasy points (includes Misc-Points from spreadsheet)
      const spreadsheetPoints = Number(row['Total-Points']) || 0;
      if (appStats) {
        const match = Math.abs(appStats.fantasyPoints - spreadsheetPoints) < 0.01;
        results.push({
          playerName,
          field: 'Fantasy Points (incl. Misc)',
          appValue: appStats.fantasyPoints,
          spreadsheetValue: spreadsheetPoints,
          match,
        });

        // Validate appearances
        const spreadsheetApps = Number(row.Appearance) || 0;
        const matchApps = appStats.appearances === spreadsheetApps;
        results.push({
          playerName,
          field: 'Appearances',
          appValue: appStats.appearances,
          spreadsheetValue: spreadsheetApps,
          match: matchApps,
        });

        // Validate goals
        const spreadsheetGoals = Number(row.Goals) || 0;
        const matchGoals = appStats.goals === spreadsheetGoals;
        results.push({
          playerName,
          field: 'Goals',
          appValue: appStats.goals,
          spreadsheetValue: spreadsheetGoals,
          match: matchGoals,
        });

        // Validate assists
        const spreadsheetAssists = Number(row.Assists) || 0;
        const matchAssists = appStats.assists === spreadsheetAssists;
        results.push({
          playerName,
          field: 'Assists',
          appValue: appStats.assists,
          spreadsheetValue: spreadsheetAssists,
          match: matchAssists,
        });

        // Validate clean sheets
        const spreadsheetCS = Number(row['Clean Sheet']) || 0;
        const matchCS = appStats.cleanSheets === spreadsheetCS;
        results.push({
          playerName,
          field: 'Clean Sheets',
          appValue: appStats.cleanSheets,
          spreadsheetValue: spreadsheetCS,
          match: matchCS,
        });
      }

      // Validate payments (compare matchFees only, before season fee is applied)
      if (appPayment) {
        const spreadsheetFees = parseFloat(String(row.Fees || '0').replace(/[£,]/g, ''));
        const matchFeesMatch = Math.abs(appPayment.matchFees - spreadsheetFees) < 0.01;
        results.push({
          playerName,
          field: 'Match Fees',
          appValue: `£${appPayment.matchFees.toFixed(2)}`,
          spreadsheetValue: `£${spreadsheetFees.toFixed(2)}`,
          match: matchFeesMatch,
        });

        const spreadsheetPayments = parseFloat(String(row.Payments || '0').replace(/[£,]/g, ''));
        const matchPayments = Math.abs(appPayment.paid - spreadsheetPayments) < 0.01;
        results.push({
          playerName,
          field: 'Payments',
          appValue: `£${appPayment.paid.toFixed(2)}`,
          spreadsheetValue: `£${spreadsheetPayments.toFixed(2)}`,
          match: matchPayments,
        });

        const spreadsheetDue = parseFloat(String(row.Due || '0').replace(/[£,]/g, ''));
        const matchDue = Math.abs(appPayment.balance - spreadsheetDue) < 0.01;
        results.push({
          playerName,
          field: 'Balance Due',
          appValue: `£${appPayment.balance.toFixed(2)}`,
          spreadsheetValue: `£${spreadsheetDue.toFixed(2)}`,
          match: matchDue,
        });
      }
    });
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to validate data';
    console.error('Validation error:', e);
  }

  const mismatches = results.filter(r => !r.match);
  const totalChecks = results.length;
  const passedChecks = results.filter(r => r.match).length;
  const passRate = totalChecks > 0 ? ((passedChecks / totalChecks) * 100).toFixed(1) : '0';

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-navy mb-2">Data Validation</h2>
          <p className="text-gray-600">Comparing app calculations vs spreadsheet values</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-800 mb-2">Validation Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-2">Data Validation</h2>
        <p className="text-gray-600">Comparing app calculations vs spreadsheet values</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`rounded-lg p-6 text-center ${
          mismatches.length === 0 ? 'bg-green-50 border-2 border-green-500' : 'bg-white border border-gray-200'
        }`}>
          <div className="text-4xl font-bold text-navy mb-2">{passedChecks}/{totalChecks}</div>
          <div className="text-sm text-gray-600">Checks Passed</div>
        </div>
        <div className={`rounded-lg p-6 text-center ${
          mismatches.length === 0 ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
        }`}>
          <div className="text-4xl font-bold mb-2" style={{ color: mismatches.length === 0 ? '#16a34a' : '#dc2626' }}>
            {passRate}%
          </div>
          <div className="text-sm text-gray-600">Pass Rate</div>
        </div>
        <div className={`rounded-lg p-6 text-center ${
          mismatches.length === 0 ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
        }`}>
          <div className="text-4xl font-bold mb-2" style={{ color: mismatches.length === 0 ? '#16a34a' : '#dc2626' }}>
            {mismatches.length}
          </div>
          <div className="text-sm text-gray-600">Mismatches</div>
        </div>
      </div>

      {/* Overall Status */}
      {mismatches.length === 0 ? (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">All Checks Passed!</h3>
          <p className="text-green-700">
            All {totalChecks} validation checks passed. App calculations match the spreadsheet perfectly.
          </p>
        </div>
      ) : (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6">
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-red-800 mb-2">Mismatches Found</h3>
            <p className="text-red-700">
              {mismatches.length} validation check{mismatches.length !== 1 ? 's' : ''} failed.
              Review the details below.
            </p>
          </div>

          {/* Mismatch Details */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Mismatch Details:</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-red-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Player</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Field</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">App Value</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Spreadsheet</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mismatches.map((result, idx) => {
                    const appNum = typeof result.appValue === 'string'
                      ? parseFloat(result.appValue.replace(/[£,]/g, ''))
                      : result.appValue;
                    const sheetNum = typeof result.spreadsheetValue === 'string'
                      ? parseFloat(result.spreadsheetValue.replace(/[£,]/g, ''))
                      : result.spreadsheetValue;
                    const diff = appNum - sheetNum;

                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{result.playerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{result.field}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-navy">
                          {result.appValue}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-700">
                          {result.spreadsheetValue}
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-bold text-red-700">
                          {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* All Results (Collapsible) */}
      <details className="bg-white border border-gray-200 rounded-lg p-4">
        <summary className="cursor-pointer font-semibold text-gray-900 hover:text-navy">
          View All Validation Results ({totalChecks} checks)
        </summary>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Player</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Field</th>
                <th className="px-3 py-2 text-center font-semibold text-gray-700">App</th>
                <th className="px-3 py-2 text-center font-semibold text-gray-700">Spreadsheet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((result, idx) => (
                <tr key={idx} className={result.match ? '' : 'bg-red-50'}>
                  <td className="px-3 py-2 text-center">
                    {result.match ? '✅' : '❌'}
                  </td>
                  <td className="px-3 py-2 text-gray-900">{result.playerName}</td>
                  <td className="px-3 py-2 text-gray-700">{result.field}</td>
                  <td className="px-3 py-2 text-center font-medium text-navy">{result.appValue}</td>
                  <td className="px-3 py-2 text-center text-gray-700">{result.spreadsheetValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
