'use client';

import { useState, useEffect } from 'react';

interface PlayerSubmission {
  id: number;
  player_name: string;
  appearance: number;
  goals: number;
  assists: number;
  clean_sheet: number;
  yellow_card: number;
  red_card: number;
  mom_1: number;
  mom_2: number;
  mom_3: number;
  dod: number;
}

interface MatchSubmission {
  id: number;
  match_key: string;
  date: string;
  team: string;
  opponent: string;
  cpr_score: number;
  opponent_score: number;
  gameweek: string;
  submitted_at: string;
  submitted_by: string | null;
}

interface Submission {
  match: MatchSubmission;
  players: PlayerSubmission[];
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clearingMatchKey, setClearingMatchKey] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/match-submissions');
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const promptClearSubmission = (matchKey: string) => {
    setClearingMatchKey(matchKey);
    setPassword('');
  };

  const handleClearSubmission = async () => {
    if (!clearingMatchKey) return;

    try {
      const response = await fetch(`/api/match-submission?password=${encodeURIComponent(password)}&matchKey=${encodeURIComponent(clearingMatchKey)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          setError('Incorrect password');
        } else {
          throw new Error(data.error || 'Failed to delete submission');
        }
        return;
      }

      // Success - close modal and reload
      setClearingMatchKey(null);
      setPassword('');
      setError(null);
      loadSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete submission');
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-bold text-slate-100 mb-3 tracking-tight">MATCH SUBMISSIONS</h2>
          <p className="text-gray-400 font-light tracking-wide">
            View submitted match data awaiting approval
          </p>
        </div>
        <button
          onClick={loadSubmissions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="text-gray-400">Loading submissions...</div>
        </div>
      )}

      {error && !clearingMatchKey && (
        <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-6">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {!loading && submissions.length === 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            No Submissions Yet
          </h3>
          <p className="text-gray-400 font-light">
            Submitted match data will appear here.
          </p>
        </div>
      )}

      {!loading && submissions.length > 0 && (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.match.id}
              className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
            >
              {/* Match Header */}
              <div className="bg-slate-700 p-4 border-b border-slate-600">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-100 mb-1">
                      {submission.match.team} {submission.match.cpr_score}-{submission.match.opponent_score} {submission.match.opponent}
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>📅 {submission.match.date}</span>
                      <span>🎮 Gameweek {submission.match.gameweek}</span>
                      {submission.match.submitted_by && (
                        <span>👤 {submission.match.submitted_by}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Submitted: {new Date(submission.match.submitted_at).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => promptClearSubmission(submission.match.match_key)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                  >
                    Clear Submission
                  </button>
                </div>
              </div>

              {/* Player Stats */}
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-slate-700">
                        <th className="text-left py-2 px-2">Player</th>
                        <th className="text-center py-2 px-2">App</th>
                        <th className="text-center py-2 px-2">Goals</th>
                        <th className="text-center py-2 px-2">Assists</th>
                        <th className="text-center py-2 px-2">MoM</th>
                        <th className="text-center py-2 px-2">MoM 2</th>
                        <th className="text-center py-2 px-2">MoM 3</th>
                        <th className="text-center py-2 px-2">DoD</th>
                        <th className="text-center py-2 px-2">Yellow</th>
                        <th className="text-center py-2 px-2">Red</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submission.players.map((player) => (
                        <tr
                          key={player.id}
                          className="border-b border-slate-700 hover:bg-slate-700/50"
                        >
                          <td className="py-2 px-2 text-gray-100 font-medium">{player.player_name}</td>
                          <td className="text-center py-2 px-2 text-gray-300">{player.appearance}</td>
                          <td className="text-center py-2 px-2 text-gray-300">{player.goals}</td>
                          <td className="text-center py-2 px-2 text-gray-300">{player.assists}</td>
                          <td className="text-center py-2 px-2 text-gray-300">{player.mom_1}</td>
                          <td className="text-center py-2 px-2 text-gray-300">{player.mom_2}</td>
                          <td className="text-center py-2 px-2 text-gray-300">{player.mom_3}</td>
                          <td className="text-center py-2 px-2 text-gray-300">{player.dod}</td>
                          <td className="text-center py-2 px-2 text-gray-300">{player.yellow_card}</td>
                          <td className="text-center py-2 px-2 text-gray-300">{player.red_card}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Instructions */}
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-200">
                    <strong>To finalize:</strong> Copy this data to Google Sheets, then click "Clear Submission" to remove it from the database.
                    The app will then show the official data from Google Sheets with calculated fantasy points.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Password Modal for Clear Submission */}
      {clearingMatchKey && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Enter Password to Clear</h3>
            {error && (
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 mb-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleClearSubmission()}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-slate-700 text-gray-100 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setClearingMatchKey(null);
                  setPassword('');
                  setError(null);
                }}
                className="flex-1 py-3 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearSubmission}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Clear Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
