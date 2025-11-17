export default function PaymentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-2">Payments Tracker</h2>
        <p className="text-gray-600">Who has paid and outstanding balances - Coming soon!</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">💰</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Status
        </h3>
        <p className="text-gray-600 mb-4">
          Track who has paid their match fees and outstanding balances.
        </p>
        <div className="text-sm text-gray-500">
          This page will show payment history, amounts due, and who owes money.
        </div>
      </div>
    </div>
  );
}
