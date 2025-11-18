'use client';

import { useState, useEffect } from 'react';
import { getPlayerFines, PlayerFineDetail } from '@/lib/fines-processor';
import PongGame from '@/components/PongGame';

export default function FinesPage() {
  const [players, setPlayers] = useState<PlayerFineDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerFineDetail | null>(null);
  const [showPongGame, setShowPongGame] = useState(false);
  const [pongPlayer, setPongPlayer] = useState<PlayerFineDetail | null>(null);

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
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">FINES</h2>
          <p className="text-gray-400 font-light tracking-wide">Player fines and penalties</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400 font-light">Loading fines data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">FINES</h2>
          <p className="text-gray-400 font-light tracking-wide">Player fines and penalties</p>
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-700 font-light">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats (excluding fines above £5)
  const totalFines = players.reduce((sum, p) => {
    const filteredFines = p.fineDetails
      .filter(fine => fine.amount <= 5)
      .reduce((fineSum, fine) => fineSum + fine.amount, 0);
    return sum + filteredFines;
  }, 0);

  const totalCount = players.reduce((sum, p) => {
    const filteredCount = p.fineDetails.filter(fine => fine.amount <= 5).length;
    return sum + filteredCount;
  }, 0);

  const averageFine = totalCount > 0 ? totalFines / totalCount : 0;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">FINES</h2>
        <p className="text-gray-400 font-light tracking-wide">
          Tap a player to see detailed breakdown of all fines
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-700 tabular-nums">{formatCurrency(totalFines)}</div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-2 font-semibold">Total Fines</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-navy tabular-nums">{totalCount}</div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-2 font-semibold">Total Incidents</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-300 tabular-nums">{formatCurrency(averageFine)}</div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-2 font-semibold">Avg Fine</div>
        </div>
      </div>

      {/* Player Leaderboard */}
      <div className="space-y-2">
        {players.map((player, index) => {
          // Calculate filtered totals for display (≤ £5 only)
          const filteredFines = player.fineDetails.filter(fine => fine.amount <= 5);
          const displayTotal = filteredFines.reduce((sum, fine) => sum + fine.amount, 0);
          const displayCount = filteredFines.length;
          const displayAvg = displayCount > 0 ? displayTotal / displayCount : 0;

          return (
            <button
              key={player.name}
              onClick={() => {
                if (player.name === 'J. Heatley') {
                  setPongPlayer(player);
                  setShowPongGame(true);
                } else {
                  setSelectedPlayer(player);
                }
              }}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors touch-manipulation text-left"
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
                    <div className="font-semibold text-gray-100">{player.name}</div>
                    <div className="text-sm text-gray-500">
                      {displayCount} fine{displayCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-red-700">
                    {formatCurrency(displayTotal)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(displayAvg)} avg
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-sm text-gray-500 text-center font-light">
        <p>Tap any player to view detailed fine history</p>
      </div>

      {/* Pong Game Modal */}
      {showPongGame && pongPlayer && (
        <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50">
          <div className="relative">
            <button
              onClick={() => {
                setShowPongGame(false);
                setPongPlayer(null);
              }}
              className="absolute -top-2 -right-2 z-10 bg-white text-black hover:bg-gray-200 rounded-full p-2 transition-colors"
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
            <PongGame
              onGameOver={() => {
                setShowPongGame(false);
                setSelectedPlayer(pongPlayer);
                setPongPlayer(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
              <div className="p-6 rounded-lg mb-6 text-center bg-red-900/20 border border-red-800">
                <div className="text-sm text-gray-400 mb-2">Total Fines</div>
                <div className="text-4xl font-bold text-red-700">
                  {formatCurrency(selectedPlayer.totalFines)}
                </div>
                {(() => {
                  const regularFines = selectedPlayer.fineDetails
                    .filter(fine => fine.amount <= 5)
                    .reduce((sum, fine) => sum + fine.amount, 0);
                  const miscellaneous = selectedPlayer.fineDetails
                    .filter(fine => fine.amount > 5)
                    .reduce((sum, fine) => sum + fine.amount, 0);

                  return (
                    <div className="text-sm text-gray-300 mt-3">
                      {formatCurrency(regularFines)} in fines + {formatCurrency(miscellaneous)} Miscellaneous
                    </div>
                  );
                })()}
              </div>

              {/* Fines Breakdown */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-100 mb-3">Fine Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-slate-800 border border-slate-700 rounded-lg text-sm">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-300">Date</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-300">Description</th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-300">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPlayer.fineDetails.map((fine, idx) => (
                        <tr key={idx} className="border-t border-slate-700">
                          <td className="px-3 py-2 text-gray-100">{fine.date}</td>
                          <td className="px-3 py-2 text-gray-400">{fine.description}</td>
                          <td className="px-3 py-2 text-right text-red-700 font-semibold">
                            {formatCurrency(fine.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-slate-600 bg-slate-700">
                        <td colSpan={2} className="px-3 py-2 font-semibold text-gray-100">
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
