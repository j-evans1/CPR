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
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">PAYMENTS</h2>
          <p className="text-gray-400 font-light tracking-wide">Match fees and payment status</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400 font-light">Loading payment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">PAYMENTS</h2>
          <p className="text-gray-400 font-light tracking-wide">Match fees and payment status</p>
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-700 font-light">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalOwed = players.reduce((sum, p) => sum + p.totalOwed, 0);
  const totalPaid = players.reduce((sum, p) => sum + p.paid, 0);
  const totalOutstanding = players.reduce((sum, p) => sum + Math.max(0, p.balance), 0);
  const playersInDebt = players.filter(p => p.balance > 0).length;

  // Find most recent payment date
  const getMostRecentDate = () => {
    let mostRecent: Date | null = null;

    players.forEach(player => {
      player.paymentDetails.forEach(payment => {
        const [day, month, year] = payment.date.split('/').map(Number);
        const date = new Date(year, month - 1, day);

        if (!mostRecent || date > mostRecent) {
          mostRecent = date;
        }
      });
    });

    return mostRecent;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const lastUpdated = getMostRecentDate();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">PAYMENTS</h2>
        <p className="text-gray-400 font-light tracking-wide">
          Tap a player to see detailed breakdown of match fees and payments
        </p>
        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-2 font-light">
            Last updated: {formatDate(lastUpdated)}
          </p>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-navy tabular-nums">{formatCurrency(totalOwed)}</div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-2 font-semibold">Total Owed</div>
        </div>
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-700 tabular-nums">{formatCurrency(totalPaid)}</div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-2 font-semibold">Total Paid</div>
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-700 tabular-nums">{formatCurrency(totalOutstanding)}</div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-2 font-semibold">Outstanding</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-300 tabular-nums">{playersInDebt}</div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-2 font-semibold">In Debt</div>
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
                      {player.matchCount} matches
                      {player.fines > 0 ? ` • ${player.fineDetails.length} fine${player.fineDetails.length !== 1 ? 's' : ''}` : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${
                    isPositiveBalance ? 'text-red-700' :
                    isNegativeBalance ? 'text-green-700' :
                    'text-gray-300'
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
      <div className="mt-8 text-sm text-gray-500 text-center font-light">
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
