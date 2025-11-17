'use client';

import { useState, useEffect } from 'react';
import { getPlayerFines, PlayerFineDetail } from '@/lib/fines-processor';

export default function FinesPage() {
  const [players, setPlayers] = useState<PlayerFineDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerFineDetail | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPlayerFines();
        setPlayers(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load fines data');
        console.error('Error loading fines:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6 bg-navy text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Fines Tracker</h2>
          <p className="opacity-90">Player fines and penalties</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading fines data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6 bg-navy text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Fines Tracker</h2>
          <p className="opacity-90">Player fines and penalties</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalFines = players.reduce((sum, p) => sum + p.totalFines, 0);
  const totalCount = players.reduce((sum, p) => sum + p.fineCount, 0);
  const averageFine = totalCount > 0 ? totalFines / totalCount : 0;

  return (
    <div>
      <div className="mb-6 bg-navy text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Fines Tracker</h2>
        <p className="opacity-90">
          Tap a player to see detailed breakdown of all fines
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-red-700">{formatCurrency(totalFines)}</div>
          <div className="text-xs text-gray-600 mt-1">Total Fines</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-navy">{totalCount}</div>
          <div className="text-xs text-gray-600 mt-1">Total Incidents</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-gray-700">{formatCurrency(averageFine)}</div>
          <div className="text-xs text-gray-600 mt-1">Avg Fine</div>
        </div>
      </div>

      {/* Player Leaderboard */}
      <div className="space-y-2">
        {players.map((player, index) => (
          <button
            key={player.name}
            onClick={() => setSelectedPlayer(player)}
            className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation text-left"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-3 flex-1">
                <div className="text-lg font-bold text-gray-400 min-w-[2rem]">
                  {index + 1}
                </div>
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{player.name}</div>
                  <div className="text-sm text-gray-500">
                    {player.fineCount} fine{player.fineCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-red-700">
                  {formatCurrency(player.totalFines)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(player.totalFines / player.fineCount)} avg
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>Tap any player to view detailed fine history</p>
      </div>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-navy text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedPlayer.name}</h2>
                  <div className="text-sm opacity-90">
                    {selectedPlayer.fineCount} fine{selectedPlayer.fineCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Total Fines */}
              <div className="p-6 rounded-lg mb-6 text-center bg-red-50 border border-red-200">
                <div className="text-sm text-gray-600 mb-2">Total Fines</div>
                <div className="text-4xl font-bold text-red-700">
                  {formatCurrency(selectedPlayer.totalFines)}
                </div>
              </div>

              {/* Fines Breakdown */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Fine Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Date</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Description</th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPlayer.fineDetails.map((fine, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="px-3 py-2 text-gray-900">{fine.date}</td>
                          <td className="px-3 py-2 text-gray-600">{fine.description}</td>
                          <td className="px-3 py-2 text-right text-red-700 font-semibold">
                            {formatCurrency(fine.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300 bg-gray-50">
                        <td colSpan={2} className="px-3 py-2 font-semibold text-gray-900">
                          Total ({selectedPlayer.fineCount} fine{selectedPlayer.fineCount !== 1 ? 's' : ''})
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-red-700">
                          {formatCurrency(selectedPlayer.totalFines)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
