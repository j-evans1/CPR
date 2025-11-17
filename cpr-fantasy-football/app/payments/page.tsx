'use client';

import { useState, useEffect } from 'react';
import { getPlayerPayments, PlayerPaymentDetail } from '@/lib/payment-processor';
import PlayerDetailModal from '@/components/PlayerDetailModal';

export default function PaymentsPage() {
  const [players, setPlayers] = useState<PlayerPaymentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerPaymentDetail | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPlayerPayments();
        setPlayers(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load payment data');
        console.error('Error loading payments:', e);
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-navy mb-2">Payments Tracker</h2>
          <p className="text-gray-600">Match fees, fines, and payment status</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-navy mb-2">Payments Tracker</h2>
          <p className="text-gray-600">Match fees, fines, and payment status</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalOwed = players.reduce((sum, p) => sum + p.totalOwed, 0);
  const totalPaid = players.reduce((sum, p) => sum + p.paid, 0);
  const totalOutstanding = players.reduce((sum, p) => sum + Math.max(0, p.balance), 0);
  const playersInDebt = players.filter(p => p.balance > 0).length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-2">Payments Tracker</h2>
        <p className="text-gray-600">
          Tap a player to see detailed breakdown of fees, fines, and payments
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-navy">{formatCurrency(totalOwed)}</div>
          <div className="text-xs text-gray-600 mt-1">Total Owed</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-700">{formatCurrency(totalPaid)}</div>
          <div className="text-xs text-gray-600 mt-1">Total Paid</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-red-700">{formatCurrency(totalOutstanding)}</div>
          <div className="text-xs text-gray-600 mt-1">Outstanding</div>
        </div>
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-gray-700">{playersInDebt}</div>
          <div className="text-xs text-gray-600 mt-1">In Debt</div>
        </div>
      </div>

      {/* Player Leaderboard */}
      <div className="space-y-2">
        {players.map((player, index) => {
          const isPositiveBalance = player.balance > 0;
          const isNegativeBalance = player.balance < 0;

          return (
            <button
              key={player.name}
              onClick={() => setSelectedPlayer(player)}
              className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-lg font-bold text-gray-400 min-w-[2rem]">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{player.name}</div>
                    <div className="text-sm text-gray-500">
                      {player.matchCount} matches • {player.fineDetails.length} fine{player.fineDetails.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${
                    isPositiveBalance ? 'text-red-700' :
                    isNegativeBalance ? 'text-green-700' :
                    'text-gray-700'
                  }`}>
                    {isPositiveBalance ? 'Owes ' : isNegativeBalance ? 'Credit ' : ''}
                    {formatCurrency(Math.abs(player.balance))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(player.totalOwed)} owed • {formatCurrency(player.paid)} paid
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>Tap any player to view detailed payment history</p>
        <p className="mt-1">Data updates automatically on page refresh</p>
      </div>

      {/* Player Detail Modal */}
      <PlayerDetailModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  );
}
