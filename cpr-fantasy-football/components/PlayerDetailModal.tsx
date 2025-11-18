'use client';

import { PlayerPaymentDetail } from '@/lib/payment-processor';

interface PlayerDetailModalProps {
  player: PlayerPaymentDetail | null;
  onClose: () => void;
}

export default function PlayerDetailModal({ player, onClose }: PlayerDetailModalProps) {
  if (!player) return null;

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-navy text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{player.name}</h2>
              <div className="text-sm opacity-90">{player.matchCount} matches played</div>
            </div>
            <button
              onClick={onClose}
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
          {/* Total Owed */}
          <div className={`p-6 rounded-lg mb-6 text-center ${
            player.balance > 0
              ? 'bg-red-900/20 border border-red-800'
              : player.balance < 0
              ? 'bg-green-900/20 border border-green-800'
              : 'bg-slate-700 border border-slate-600'
          }`}>
            <div className="text-sm text-gray-400 mb-2">Total Owed</div>
            <div className={`text-4xl font-bold ${
              player.balance > 0
                ? 'text-red-700'
                : player.balance < 0
                ? 'text-green-700'
                : 'text-gray-300'
            }`}>
              {player.balance > 0 ? 'Owes ' : player.balance < 0 ? 'Credit ' : ''}
              {formatCurrency(Math.abs(player.balance))}
            </div>
          </div>

          {/* Fees Breakdown */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-100 mb-3">Fees Breakdown</h3>
            {player.matchDetails.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-slate-800 border border-slate-700 rounded-lg text-sm">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-white">Date</th>
                      <th className="px-3 py-2 text-left font-semibold text-white">Match</th>
                      <th className="px-3 py-2 text-right font-semibold text-white">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {player.matchDetails.map((match, idx) => (
                      <tr key={idx} className="border-t border-slate-700">
                        <td className="px-3 py-2 text-white">{match.date}</td>
                        <td className="px-3 py-2 text-white">{match.game}</td>
                        <td className="px-3 py-2 text-right text-white font-semibold">{formatCurrency(match.fee)}</td>
                      </tr>
                    ))}
                    {player.fines > 0 && (
                      <tr className="border-t border-slate-600 bg-red-900/20">
                        <td colSpan={2} className="px-3 py-2 text-white">
                          Fines ({player.fineDetails.length})
                        </td>
                        <td className="px-3 py-2 text-right text-white font-semibold">{formatCurrency(player.fines)}</td>
                      </tr>
                    )}
                    {player.seasonFees > 0 && (
                      <tr className="border-t border-slate-600 bg-blue-900/20">
                        <td colSpan={2} className="px-3 py-2 text-white">Season Fee</td>
                        <td className="px-3 py-2 text-right text-white font-semibold">{formatCurrency(player.seasonFees)}</td>
                      </tr>
                    )}
                    <tr className="border-t-2 border-slate-600 bg-slate-700">
                      <td colSpan={2} className="px-3 py-2 font-semibold text-white">Total Owed</td>
                      <td className="px-3 py-2 text-right font-bold text-white">{formatCurrency(player.totalOwed)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Match Fees ({player.matchCount} matches)</span>
                    <span className="font-semibold text-white">{formatCurrency(player.matchFees)}</span>
                  </div>
                  {player.fines > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-white">Fines ({player.fineDetails.length})</span>
                      <span className="font-semibold text-white">{formatCurrency(player.fines)}</span>
                    </div>
                  )}
                  {player.seasonFees > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-white">Season Fee</span>
                      <span className="font-semibold text-white">{formatCurrency(player.seasonFees)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                    <span className="font-semibold text-white">Total Owed</span>
                    <span className="font-bold text-white">{formatCurrency(player.totalOwed)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Payments */}
          {player.paid > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-100 mb-3">Payments Received</h3>
              {player.paymentDetails.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-slate-800 border border-slate-700 rounded-lg text-sm">
                    <thead className="bg-green-900/20">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-white">Date</th>
                        <th className="px-3 py-2 text-left font-semibold text-white">Description</th>
                        <th className="px-3 py-2 text-right font-semibold text-white">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {player.paymentDetails.map((payment, idx) => (
                        <tr key={idx} className="border-t border-slate-700">
                          <td className="px-3 py-2 text-white">{payment.date}</td>
                          <td className="px-3 py-2 text-white text-xs">{payment.description}</td>
                          <td className="px-3 py-2 text-right text-white font-semibold">{formatCurrency(payment.amount)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-slate-600 bg-green-900/20">
                        <td colSpan={2} className="px-3 py-2 font-semibold text-white">Total Paid</td>
                        <td className="px-3 py-2 text-right font-bold text-white">{formatCurrency(player.paid)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg border border-green-800">
                  <span className="font-semibold text-white">Total Paid</span>
                  <span className="font-bold text-white">{formatCurrency(player.paid)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
