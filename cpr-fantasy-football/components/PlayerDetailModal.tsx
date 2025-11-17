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
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
          {/* Balance Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Owed</div>
              <div className="text-2xl font-bold text-red-700">{formatCurrency(player.totalOwed)}</div>
              <div className="text-xs text-gray-500 mt-1">
                Match Fees: {formatCurrency(player.matchFees)} + Season Fee: {formatCurrency(player.seasonFees)}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Paid</div>
              <div className="text-2xl font-bold text-green-700">{formatCurrency(player.paid)}</div>
            </div>
          </div>

          {/* Balance Badge */}
          <div className={`p-4 rounded-lg mb-6 text-center ${
            player.balance > 0
              ? 'bg-red-50 border border-red-200'
              : player.balance < 0
              ? 'bg-green-50 border border-green-200'
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="text-sm text-gray-600 mb-1">Current Balance</div>
            <div className={`text-3xl font-bold ${
              player.balance > 0
                ? 'text-red-700'
                : player.balance < 0
                ? 'text-green-700'
                : 'text-gray-700'
            }`}>
              {player.balance > 0 ? 'Owes ' : player.balance < 0 ? 'Credit ' : ''}
              {formatCurrency(Math.abs(player.balance))}
            </div>
          </div>

          {/* Match Fees */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Match Fees</h3>
            {player.matchDetails.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Date</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Gameweek</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {player.matchDetails.map((match, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-gray-900">{match.date}</td>
                        <td className="px-3 py-2 text-gray-600">{match.gameweek}</td>
                        <td className="px-3 py-2 text-right text-navy font-semibold">{formatCurrency(match.fee)}</td>
                      </tr>
                    ))}
                    {player.seasonFees > 0 && (
                      <tr className="border-t border-gray-200 bg-blue-50">
                        <td colSpan={2} className="px-3 py-2 text-gray-900">Season Fee</td>
                        <td className="px-3 py-2 text-right text-navy font-semibold">{formatCurrency(player.seasonFees)}</td>
                      </tr>
                    )}
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td colSpan={2} className="px-3 py-2 font-semibold text-gray-900">Total</td>
                      <td className="px-3 py-2 text-right font-bold text-navy">{formatCurrency(player.matchFees + player.seasonFees)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{player.matchCount} matches</span>
                  <span className="font-semibold text-navy">{formatCurrency(player.matchFees)}</span>
                </div>
              </div>
            )}
          </div>


          {/* Payments */}
          {player.paid > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Payments Received</h3>
              {player.paymentDetails.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg text-sm">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Date</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Description</th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {player.paymentDetails.map((payment, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="px-3 py-2 text-gray-900">{payment.date}</td>
                          <td className="px-3 py-2 text-gray-600 text-xs">{payment.description}</td>
                          <td className="px-3 py-2 text-right text-green-700 font-semibold">{formatCurrency(payment.amount)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300 bg-green-50">
                        <td colSpan={2} className="px-3 py-2 font-semibold text-gray-900">Total Paid</td>
                        <td className="px-3 py-2 text-right font-bold text-green-700">{formatCurrency(player.paid)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border border-green-200">
                  <span className="font-semibold text-gray-900">Total Paid</span>
                  <span className="font-bold text-green-700">{formatCurrency(player.paid)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
