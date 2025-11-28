'use client';

import { useState, useEffect, useRef } from 'react';
import { Match } from '@/lib/match-processor';
import { generateMatchKey } from '@/lib/submission-merger';

interface MoMVoteModalProps {
  match: Match;
  onClose: () => void;
  onSuccess: () => void;
}

interface VoteResult {
  player_name: string;
  vote_count: number;
}

export default function MoMVoteModal({ match, onClose, onSuccess }: MoMVoteModalProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [isOther, setIsOther] = useState(false);
  const [customPlayer, setCustomPlayer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [results, setResults] = useState<VoteResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [resultsRevealed, setResultsRevealed] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showChangeVoteForm, setShowChangeVoteForm] = useState(false);
  const [wasViewingResults, setWasViewingResults] = useState(false);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get players from the match, sorted alphabetically
  const matchPlayers = match.players.map(p => p.name).sort();
  const matchKey = generateMatchKey(match.date, match.team, match.opponent);

  // Get or create voter ID
  const getVoterId = () => {
    let voterId = localStorage.getItem('momVoterId');
    if (!voterId) {
      // Generate a unique voter ID
      voterId = `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('momVoterId', voterId);
    }
    return voterId;
  };

  // Check if user has already voted for this match and load their vote
  useEffect(() => {
    const votedMatches = JSON.parse(localStorage.getItem('momVotes') || '{}');
    if (votedMatches[matchKey]) {
      setHasVoted(true);
      // Pre-select their previous vote if they want to change it (only if form not shown yet)
      if (!showChangeVoteForm) {
        const previousVote = votedMatches[matchKey].playerName;
        if (matchPlayers.includes(previousVote)) {
          setSelectedPlayer(previousVote);
        } else {
          setIsOther(true);
          setCustomPlayer(previousVote);
        }
      }
    }

    // Check if results are already revealed
    checkIfResultsRevealed();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchKey]);

  const checkIfResultsRevealed = async () => {
    try {
      const response = await fetch(`/api/mom-vote?matchKey=${encodeURIComponent(matchKey)}`);
      const data = await response.json();

      if (response.ok && data.resultsRevealed) {
        setResultsRevealed(true);
      }
    } catch (err) {
      console.error('Failed to check if results revealed:', err);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const playerToVote = isOther ? customPlayer.trim() : selectedPlayer;

    if (!playerToVote) {
      setError('Please select or enter a player name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const voterId = getVoterId();
      const response = await fetch('/api/mom-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchKey,
          playerName: playerToVote,
          voterId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit vote');
      }

      // Store vote in localStorage to prevent duplicate votes
      const votedMatches = JSON.parse(localStorage.getItem('momVotes') || '{}');
      votedMatches[matchKey] = {
        playerName: playerToVote,
        votedAt: new Date().toISOString()
      };
      localStorage.setItem('momVotes', JSON.stringify(votedMatches));

      setSuccess(true);
      // Store timeout ID so we can cancel it if user navigates elsewhere
      autoCloseTimeoutRef.current = setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayerSelect = (player: string) => {
    if (player === 'OTHER') {
      setIsOther(true);
      setSelectedPlayer('');
    } else {
      setIsOther(false);
      setSelectedPlayer(player);
      setCustomPlayer('');
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/mom-vote?matchKey=${encodeURIComponent(matchKey)}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
        setTotalVotes(data.totalVotes || 0);
        setResultsRevealed(data.resultsRevealed || false);
        setShowResults(true);
      } else {
        setError(data.error || 'Failed to fetch results');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
    }
  };

  const handleSeeResultsClick = async () => {
    // Cancel auto-close if user navigates to results
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = null;
    }
    await fetchResults();
  };

  const handleRevealResults = async () => {
    setIsRevealing(true);
    setError(null);

    try {
      const response = await fetch('/api/mom-vote', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchKey,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh results to show revealed data
        await fetchResults();
        setShowPasswordPrompt(false);
        setPassword('');
      } else {
        setError(data.error || 'Failed to reveal results');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reveal results');
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Man of the Match Vote</h2>
            <p className="text-sm text-gray-400 mt-1">
              {match.team} {match.score} {match.opponent} - {match.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Results Already Revealed - Only Show See Results */}
        {resultsRevealed && !showResults && !showPasswordPrompt && (
          <div className="m-6 bg-blue-900/30 border border-blue-600 rounded-lg p-4">
            <p className="text-blue-200 text-center mb-4">
              Voting for this match has ended. Results have been revealed!
            </p>
            <button
              onClick={handleSeeResultsClick}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              See Results
            </button>
          </div>
        )}

        {/* Success or Already Voted - Show Change Vote and Reveal Results */}
        {!resultsRevealed && (success || hasVoted) && !showResults && !showPasswordPrompt && !showChangeVoteForm && (
          <div className="m-6 bg-green-900/30 border border-green-600 rounded-lg p-4">
            <p className="text-green-200 text-center font-semibold mb-4">
              {success ? 'Vote submitted successfully!' : "You've already voted for this match!"}
            </p>
            <button
              onClick={() => {
                // Load previous vote when opening change form
                const votedMatches = JSON.parse(localStorage.getItem('momVotes') || '{}');
                if (votedMatches[matchKey]) {
                  const previousVote = votedMatches[matchKey].playerName;
                  if (matchPlayers.includes(previousVote)) {
                    setSelectedPlayer(previousVote);
                    setIsOther(false);
                    setCustomPlayer('');
                  } else {
                    setIsOther(true);
                    setCustomPlayer(previousVote);
                    setSelectedPlayer('');
                  }
                }
                setShowChangeVoteForm(true);
              }}
              className="w-full py-3 mb-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Change Vote
            </button>
            <button
              onClick={() => {
                // Cancel auto-close if user wants to reveal results
                if (autoCloseTimeoutRef.current) {
                  clearTimeout(autoCloseTimeoutRef.current);
                  autoCloseTimeoutRef.current = null;
                }
                setWasViewingResults(false);
                setShowPasswordPrompt(true);
              }}
              className="w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
            >
              Reveal Results (Captain)
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="m-6 mb-0 bg-red-900/30 border border-red-600 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Show Results Section */}
        {showResults ? (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-100 mb-2">Voting Results</h3>
              <p className="text-sm text-gray-400">Total votes: {totalVotes}</p>
            </div>

            {results.length === 0 ? (
              <div className="bg-slate-700 rounded-lg p-6 text-center">
                <p className="text-gray-300">No votes yet for this match.</p>
              </div>
            ) : (
              <>
                {resultsRevealed ? (
                  <div className="mb-6">
                    {/* Winner Announcement */}
                    {results[0] && (() => {
                      // Find all players tied for first place
                      const firstPlaceVotes = results[0].vote_count;
                      const winners = results.filter(r => r.vote_count === firstPlaceVotes);

                      return (
                        <div className="bg-gradient-to-r from-yellow-600/30 to-yellow-800/30 border-2 border-yellow-500 rounded-lg p-4 mb-4 text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="text-3xl">🏆</span>
                            <h4 className="text-xl font-bold text-yellow-200">
                              {winners.length > 1 ? 'Joint Men of the Match' : 'Man of the Match'}
                            </h4>
                            <span className="text-3xl">🏆</span>
                          </div>
                          <p className="text-2xl font-bold text-white mt-2">
                            {winners.map(w => w.player_name).join(' & ')}
                          </p>
                          <p className="text-yellow-300 mt-1">
                            {firstPlaceVotes} vote{firstPlaceVotes !== 1 ? 's' : ''} ({Math.round((firstPlaceVotes / totalVotes) * 100)}%)
                          </p>
                        </div>
                      );
                    })()}

                    {/* Results Table */}
                    <div className="bg-slate-700/50 rounded-lg overflow-hidden border border-slate-600">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-700 border-b border-slate-600">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 w-16">Rank</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Player</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300 w-24">Votes</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300 w-20">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((result, idx) => {
                            // Calculate golf-style ranking (ties share same rank, next rank skips)
                            let rank = 1;
                            for (let i = 0; i < idx; i++) {
                              if (results[i].vote_count !== results[i + 1]?.vote_count) {
                                rank = i + 2;
                              }
                            }

                            return (
                              <tr
                                key={idx}
                                className={`border-b border-slate-600 last:border-b-0 ${
                                  rank === 1 ? 'bg-yellow-600/10' :
                                  rank === 2 ? 'bg-gray-500/10' :
                                  rank === 3 ? 'bg-orange-600/10' :
                                  'bg-slate-800/50'
                                }`}
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {rank === 1 && <span className="text-xl">🥇</span>}
                                    {rank === 2 && <span className="text-xl">🥈</span>}
                                    {rank === 3 && <span className="text-xl">🥉</span>}
                                    {rank > 3 && <span className="text-gray-400 font-medium">{rank}</span>}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`font-medium ${rank === 1 ? 'text-yellow-200' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-orange-300' : 'text-gray-300'}`}>
                                    {result.player_name}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-gray-100 font-semibold">{result.vote_count}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-gray-300 text-sm">{Math.round((result.vote_count / totalVotes) * 100)}%</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-700 border-t-2 border-slate-500">
                            <td className="px-4 py-3" colSpan={2}>
                              <span className="text-gray-300 font-semibold">Total</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-gray-100 font-bold">{totalVotes}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-gray-300 text-sm font-semibold">100%</span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-6">
                    <p className="text-yellow-200 text-center">
                      Results are hidden until captains reveal them with the password.
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowResults(false); setShowPasswordPrompt(false); }}
                className="flex-1 py-3 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Back
              </button>
              {!resultsRevealed && (
                <button
                  onClick={() => {
                    setWasViewingResults(true);
                    setShowPasswordPrompt(true);
                  }}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Reveal Results
                </button>
              )}
            </div>
          </div>
        ) : !showPasswordPrompt ? (
          <>
            {/* Form */}
            {!resultsRevealed && !success && (!hasVoted || showChangeVoteForm) && (
              <form onSubmit={handleSubmit} className="p-6">
                {hasVoted && (
                  <div className="mb-4 bg-blue-900/30 border border-blue-600 rounded-lg p-3">
                    <p className="text-blue-200 text-sm text-center">
                      Updating your vote - your previous vote will be replaced
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  <p className="text-gray-300 mb-4">
                    Select the player you think deserves Man of the Match:
                  </p>

                  {/* Player List */}
                  {matchPlayers.map((player) => (
                    <label
                      key={player}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPlayer === player && !isOther
                          ? 'bg-blue-600/20 border-blue-500'
                          : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="player"
                        value={player}
                        checked={selectedPlayer === player && !isOther}
                        onChange={() => handlePlayerSelect(player)}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="text-gray-100 font-medium">{player}</span>
                    </label>
                  ))}

                  {/* Other Option */}
                  <label
                    className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                      isOther
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="player"
                      value="OTHER"
                      checked={isOther}
                      onChange={() => handlePlayerSelect('OTHER')}
                      className="mr-3 w-4 h-4 mt-1"
                    />
                    <div className="flex-1">
                      <span className="text-gray-100 font-medium block mb-2">Other (ringer or unexpected player)</span>
                      {isOther && (
                        <input
                          type="text"
                          value={customPlayer}
                          onChange={(e) => setCustomPlayer(e.target.value)}
                          placeholder="Enter player name"
                          className="w-full px-3 py-2 bg-slate-600 text-gray-100 rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
                          autoFocus
                        />
                      )}
                    </div>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {isSubmitting ? (hasVoted ? 'Updating Vote...' : 'Submitting Vote...') : (hasVoted ? 'Update Vote' : 'Submit Vote')}
                  </button>
                </div>

                {/* Reveal Results Button for Captain */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      // Cancel auto-close if user wants to reveal results
                      if (autoCloseTimeoutRef.current) {
                        clearTimeout(autoCloseTimeoutRef.current);
                        autoCloseTimeoutRef.current = null;
                      }
                      setWasViewingResults(false);
                      setShowPasswordPrompt(true);
                    }}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold disabled:opacity-50"
                  >
                    Reveal Results (Captain)
                  </button>
                </div>

              </form>
            )}
          </>
        ) : (
          /* Password Prompt */
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Enter Captain Password</h3>
            <p className="text-gray-300 text-sm mb-4">
              Enter the captain password to stop voting and reveal the MoM voting results. The slug password is required.
            </p>
            {error && (
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 mb-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isRevealing && password && handleRevealResults()}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-slate-700 text-gray-100 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setPassword('');
                  setError(null);
                  if (wasViewingResults) {
                    setShowResults(true);
                  }
                }}
                className="flex-1 py-3 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleRevealResults}
                disabled={isRevealing || !password}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
              >
                {isRevealing ? 'Revealing...' : 'Reveal Results'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
