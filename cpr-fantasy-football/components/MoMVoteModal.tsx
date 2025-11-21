'use client';

import { useState, useEffect } from 'react';
import { Match } from '@/lib/match-processor';
import { generateMatchKey } from '@/lib/submission-merger';

interface MoMVoteModalProps {
  match: Match;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MoMVoteModal({ match, onClose, onSuccess }: MoMVoteModalProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [isOther, setIsOther] = useState(false);
  const [customPlayer, setCustomPlayer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Get players from the match, sorted alphabetically
  const matchPlayers = match.players.map(p => p.name).sort();
  const matchKey = generateMatchKey(match.date, match.team, match.opponent);

  // Check if user has already voted for this match
  useEffect(() => {
    const votedMatches = JSON.parse(localStorage.getItem('momVotes') || '{}');
    if (votedMatches[matchKey]) {
      setHasVoted(true);
    }
  }, [matchKey]);

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
      const response = await fetch('/api/mom-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchKey,
          playerName: playerToVote,
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
      setTimeout(() => {
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

        {/* Success Message */}
        {success && (
          <div className="m-6 mb-0 bg-green-900/30 border border-green-600 rounded-lg p-4">
            <p className="text-green-200 text-center font-semibold">Vote submitted successfully!</p>
          </div>
        )}

        {/* Already Voted Message */}
        {hasVoted && !success && (
          <div className="m-6 bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
            <p className="text-yellow-200 text-center">
              You've already voted for this match! Your vote has been recorded.
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={onClose}
                className="py-2 px-6 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="m-6 mb-0 bg-red-900/30 border border-red-600 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Form */}
        {!success && !hasVoted && (
          <form onSubmit={handleSubmit} className="p-6">
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
                {isSubmitting ? 'Submitting Vote...' : 'Submit Vote'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
