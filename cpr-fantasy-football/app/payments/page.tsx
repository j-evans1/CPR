import { getPlayerPayments } from '@/lib/payment-processor';
import PaymentsView from '@/components/PaymentsView';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  let players;
  let error: string | null = null;

  try {
    players = await getPlayerPayments();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load payment data';
    console.error('Error loading payments:', e);
  }

  if (error || !players) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">PAYMENTS</h2>
          <p className="text-gray-400 font-light tracking-wide">Match fees and payment status</p>
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-700 font-light">{error || 'Failed to load payment data'}</p>
        </div>
      </div>
    );
  }

  return <PaymentsView players={players} />;
}
