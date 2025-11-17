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
                Fees: {formatCurrency(player.matchFees)} + Fines: {formatCurrency(player.fines)}
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
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{player.matchCount} matches @ various rates</span>
                <span className="font-semibold text-navy">{formatCurrency(player.matchFees)}</span>
              </div>
            </div>
          </div>

          {/* Fines */}
          {player.fineDetails.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Fines</h3>
              <div className="space-y-2">
                {player.fineDetails.map((fine, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{fine.description}</div>
                      {fine.date && <div className="text-xs text-gray-500 mt-1">{fine.date}</div>}
                    </div>
                    <div className="font-semibold text-red-700">{formatCurrency(fine.amount)}</div>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg border border-red-200">
                  <span className="font-semibold text-gray-900">Total Fines</span>
                  <span className="font-bold text-red-700">{formatCurrency(player.fines)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payments */}
          {player.paid > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Total Payments</h3>
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border border-green-200">
                <span className="font-semibold text-gray-900">Total Paid</span>
                <span className="font-bold text-green-700">{formatCurrency(player.paid)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
