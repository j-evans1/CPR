'use client';

import { useState } from 'react';
import { Match } from '@/lib/match-processor';
import SubmitMatchDataModal from './SubmitMatchDataModal';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearPassword, setClearPassword] = useState('');
  const [clearError, setClearError] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [matchReport, setMatchReport] = useState<string | null>(match.matchReport || null);
  const [reportError, setReportError] = useState<string | null>(null);

  const getResultBadge = () => {
    if (match.cprScore > match.opponentScore) {
      return { text: 'W', color: 'bg-green-500 text-white' };
    } else if (match.cprScore < match.opponentScore) {
      return { text: 'L', color: 'bg-red-500 text-white' };
    } else {
      return { text: 'D', color: 'bg-gray-400 text-white' };
    }
  };

  const result = getResultBadge();

  // Sort players by points (highest first)
  const sortedPlayers = [...match.players].sort((a, b) => b.points - a.points);

  const handleSubmitSuccess = () => {
    setShowSubmitModal(false);
    // Reload the page to show updated data
    window.location.reload();
  };

  const handleClearSubmission = async () => {
    setIsClearing(true);
    setClearError(null);

    try {
      const matchDescription = `${match.team} ${match.score} ${match.opponent}`;
      const matchKey = `${match.date}-${matchDescription}`;

      const response = await fetch(`/api/match-submission?password=${encodeURIComponent(clearPassword)}&matchKey=${encodeURIComponent(matchKey)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          setClearError('Incorrect password');
        } else {
          throw new Error(data.error || 'Failed to clear submission');
        }
        setIsClearing(false);
        return;
      }

      // Success - reload page
      window.location.reload();
    } catch (err) {
      setClearError(err instanceof Error ? err.message : 'Failed to clear submission');
      setIsClearing(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReportError(null);

    try {
      const matchDescription = `${match.team} ${match.score} ${match.opponent}`;
      const matchKey = `${match.date}-${matchDescription}`;

      const response = await fetch('/api/generate-match-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchKey,
          matchData: {
            date: match.date,
            team: match.team,
            opponent: match.opponent,
            cprScore: match.cprScore,
            opponentScore: match.opponentScore,
          },
          playerStats: match.players,
          matchSummary: match.matchSummary,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate match report');
      }

      const data = await response.json();
      setMatchReport(data.report);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Failed to generate match report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const copyReportToClipboard = async () => {
    if (matchReport) {
      try {
        await navigator.clipboard.writeText(matchReport);
        alert('Match report copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        alert('Failed to copy to clipboard');
      }
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-slate-800 border-slate-700">
      {/* Match Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-700 transition-colors touch-manipulation"
      >
        <div className="flex items-center space-x-3 flex-1">
          <div className={`text-sm font-bold px-2 py-1 rounded ${result.color} min-w-[2rem] text-center`}>
            {result.text}
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold text-gray-100 flex items-center gap-2">
              {match.team} {match.score} {match.opponent}
              {match.isSubmitted && (
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-medium">
                  SUBMITTED
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {match.date}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm text-gray-500">{match.players.length} players</div>
          </div>
          <svg
            className={`w-6 h-6 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Match Details - Expandable */}
      {isExpanded && (
        <div className="border-t border-slate-700 bg-slate-700">
          <div className="p-4">
            {/* Action Buttons */}
            <div className="mb-4 flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSubmitModal(true);
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors touch-manipulation"
              >
                {match.isSubmitted ? 'Update Match Data' : 'Submit Match Data'}
              </button>
              {match.isSubmitted && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowClearModal(true);
                    setClearPassword('');
                    setClearError(null);
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors touch-manipulation"
                >
                  Clear Submission
                </button>
              )}
            </div>

            {match.isSubmitted ? (
              <>
                {/* Submitted Data Table */}
                <div className="bg-slate-600 rounded-lg p-3 mb-3">
                  <p className="text-xs text-yellow-400 text-center">
                    ⚠️ Submitted data shown below. Fantasy points will update after data is added to Google Sheets.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-400 border-b border-slate-600">
                        <th className="text-left py-2 px-2">Player</th>
                        <th className="text-center py-2 px-1">App</th>
                        <th className="text-center py-2 px-1">Goals</th>
                        <th className="text-center py-2 px-1">Assists</th>
                        <th className="text-center py-2 px-1">MoM</th>
                        <th className="text-center py-2 px-1">MoM2</th>
                        <th className="text-center py-2 px-1">MoM3</th>
                        <th className="text-center py-2 px-1">DoD</th>
                        <th className="text-center py-2 px-1">Yellow</th>
                        <th className="text-center py-2 px-1">Red</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...match.players].sort((a, b) => a.name.localeCompare(b.name)).map((player, idx) => (
                        <tr key={idx} className="border-b border-slate-600 hover:bg-slate-600/50">
                          <td className="py-2 px-2 text-gray-100 font-medium">{player.name}</td>
                          <td className="text-center py-2 px-1 text-gray-300">{player.appearance || 0}</td>
                          <td className="text-center py-2 px-1 text-gray-300">{player.goals || 0}</td>
                          <td className="text-center py-2 px-1 text-gray-300">{player.assists || 0}</td>
                          <td className="text-center py-2 px-1 text-gray-300">{player.mom1 || 0}</td>
                          <td className="text-center py-2 px-1 text-gray-300">{player.mom2 || 0}</td>
                          <td className="text-center py-2 px-1 text-gray-300">{player.mom3 || 0}</td>
                          <td className="text-center py-2 px-1 text-gray-300">{player.dod || 0}</td>
                          <td className="text-center py-2 px-1 text-gray-300">{player.yellowCard || 0}</td>
                          <td className="text-center py-2 px-1 text-gray-300">{player.redCard || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                {/* Regular Player Performances */}
                <h4 className="font-semibold text-sm text-gray-300 mb-3 uppercase tracking-wide">
                  Player Performances
                </h4>
                <div className="space-y-1">
                  {sortedPlayers.map((player, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-slate-600 rounded-lg shadow-sm"
                    >
                      <div className="flex-1 flex items-center gap-2">
                        <div className="font-medium text-gray-100">{player.name}</div>
                        <div className="text-xs text-white flex gap-2">
                          {player.goals > 0 && <span>⚽ {player.goals}</span>}
                          {player.assists > 0 && <span>🅰️ {player.assists}</span>}
                          {player.cleanSheet > 0 && <span>🧤 CS</span>}
                          {player.yellowCard > 0 && <span>🟨 {player.yellowCard}</span>}
                          {player.redCard > 0 && <span>🟥 {player.redCard}</span>}
                          {player.goals === 0 && player.assists === 0 && player.cleanSheet === 0 && (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white tabular-nums">{player.points}</div>
                        <div className="text-xs text-gray-500">pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Match Report Section - Only show if match is submitted and has summary */}
            {match.isSubmitted && match.matchSummary && (
              <div className="mt-4 pt-4 border-t border-slate-600">
                <h4 className="font-semibold text-sm text-gray-300 mb-3 uppercase tracking-wide">
                  Match Report
                </h4>

                {reportError && (
                  <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 mb-3">
                    <p className="text-red-200 text-sm">{reportError}</p>
                  </div>
                )}

                {matchReport ? (
                  <div className="space-y-3">
                    <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                      <p className="text-gray-100 text-sm whitespace-pre-wrap leading-relaxed">{matchReport}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={copyReportToClipboard}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm"
                      >
                        📋 Copy to Clipboard
                      </button>
                      <button
                        onClick={handleGenerateReport}
                        disabled={isGeneratingReport}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm"
                      >
                        {isGeneratingReport ? '⏳ Regenerating...' : '🔄 Regenerate'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isGeneratingReport ? '⏳ Generating Match Report...' : '✨ Generate AI Match Report'}
                  </button>
                )}

                {match.matchSummary && (
                  <div className="mt-3 text-xs text-gray-400">
                    <strong>Summary:</strong> {match.matchSummary}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear Submission Password Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowClearModal(false)}>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-100 mb-4">Enter Password to Clear</h3>
            {clearError && (
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 mb-4">
                <p className="text-red-200 text-sm">{clearError}</p>
              </div>
            )}
            <input
              type="password"
              value={clearPassword}
              onChange={(e) => setClearPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleClearSubmission()}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-slate-700 text-gray-100 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 py-3 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearSubmission}
                disabled={isClearing}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
              >
                {isClearing ? 'Clearing...' : 'Clear Submission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <SubmitMatchDataModal
          match={match}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}
