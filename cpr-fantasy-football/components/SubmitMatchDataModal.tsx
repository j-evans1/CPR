'use client';

import { useState, useEffect } from 'react';
import { Match } from '@/lib/match-processor';
import { generateMatchKey } from '@/lib/submission-merger';

interface SubmitMatchDataModalProps {
  match: Match;
  onClose: () => void;
  onSuccess: () => void;
}

interface StatEntry {
  player: string;
  quantity?: number;
  isCustom: boolean;
}

export default function SubmitMatchDataModal({ match, onClose, onSuccess }: SubmitMatchDataModalProps) {
  const [allPlayers, setAllPlayers] = useState<string[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  // Get players from the match
  const matchPlayers = match.players.map(p => p.name).sort();

  // Scoreline
  const [cprScore, setCprScore] = useState<number>(match.cprScore);
  const [opponentScore, setOpponentScore] = useState<number>(match.opponentScore);

  // Match summary for AI report generation
  const [matchSummary, setMatchSummary] = useState<string>('');

  // Stat entries
  const [goals, setGoals] = useState<StatEntry[]>([]);
  const [assists, setAssists] = useState<StatEntry[]>([]);
  const [yellowCards, setYellowCards] = useState<StatEntry[]>([]);
  const [redCards, setRedCards] = useState<StatEntry[]>([]);
  const [dod, setDod] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [checkedForExisting, setCheckedForExisting] = useState(false);

  useEffect(() => {
    loadPlayers();
    checkForExistingSubmission();
  }, []);

  const loadPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      setAllPlayers(data);
    } catch (err) {
      console.error('Failed to load players:', err);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const checkForExistingSubmission = async () => {
    const matchDescription = `${match.team} ${match.score} ${match.opponent}`;
    const matchKey = generateMatchKey(match.date, match.team, match.opponent);

    try {
      const response = await fetch(`/api/match-submission?matchKey=${encodeURIComponent(matchKey)}`);
      const data = await response.json();

      if (data && data.match) {
        setShowOverwriteWarning(true);
      }
      setCheckedForExisting(true);
    } catch (err) {
      console.error('Error checking for existing submission:', err);
      setCheckedForExisting(true);
    }
  };

  const addEntry = (setter: React.Dispatch<React.SetStateAction<StatEntry[]>>, withQuantity: boolean = false) => {
    setter(prev => [...prev, { player: '', quantity: withQuantity ? 1 : undefined, isCustom: false }]);
  };

  const updateEntry = (
    setter: React.Dispatch<React.SetStateAction<StatEntry[]>>,
    index: number,
    field: 'player' | 'quantity' | 'isCustom',
    value: string | number | boolean
  ) => {
    setter(prev => {
      const updated = [...prev];
      if (field === 'player') {
        const isCustom = value === 'OTHER';
        updated[index] = { ...updated[index], player: isCustom ? '' : String(value), isCustom };
      } else if (field === 'quantity') {
        updated[index] = { ...updated[index], quantity: Number(value) };
      } else if (field === 'isCustom') {
        updated[index] = { ...updated[index], isCustom: Boolean(value) };
      }
      return updated;
    });
  };

  const removeEntry = (setter: React.Dispatch<React.SetStateAction<StatEntry[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkedForExisting) {
      await checkForExistingSubmission();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert stat-based entries to per-player format
      const playerMap = new Map<string, {
        appearance: number;
        goals: number;
        assists: number;
        cleanSheet: number;
        yellowCard: number;
        redCard: number;
        mom1: number;
        mom2: number;
        mom3: number;
        dod: number;
      }>();

      // Initialize all match players with appearance = 1
      matchPlayers.forEach(playerName => {
        playerMap.set(playerName, {
          appearance: 1,
          goals: 0,
          assists: 0,
          cleanSheet: 0,
          yellowCard: 0,
          redCard: 0,
          mom1: 0,
          mom2: 0,
          mom3: 0,
          dod: 0,
        });
      });

      // Add goals
      goals.forEach(entry => {
        if (entry.player && playerMap.has(entry.player)) {
          const stats = playerMap.get(entry.player)!;
          stats.goals += entry.quantity || 1;
        }
      });

      // Add assists
      assists.forEach(entry => {
        if (entry.player && playerMap.has(entry.player)) {
          const stats = playerMap.get(entry.player)!;
          stats.assists += entry.quantity || 1;
        }
      });

      // Add yellow cards
      yellowCards.forEach(entry => {
        if (entry.player && playerMap.has(entry.player)) {
          playerMap.get(entry.player)!.yellowCard += 1;
        }
      });

      // Add red cards
      redCards.forEach(entry => {
        if (entry.player && playerMap.has(entry.player)) {
          playerMap.get(entry.player)!.redCard += 1;
        }
      });

      // Add DoD - can be any player, even if not playing
      if (dod) {
        if (!playerMap.has(dod)) {
          playerMap.set(dod, {
            appearance: 0,
            goals: 0,
            assists: 0,
            cleanSheet: 0,
            yellowCard: 0,
            redCard: 0,
            mom1: 0,
            mom2: 0,
            mom3: 0,
            dod: 1,
          });
        } else {
          playerMap.get(dod)!.dod = 1;
        }
      }

      const matchDescription = `${match.team} ${match.score} ${match.opponent}`;
      const matchKey = `${match.date}-${matchDescription}`;

      const playersArray = Array.from(playerMap.entries()).map(([name, stats]) => ({
        name,
        ...stats,
      }));

      const response = await fetch('/api/match-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchKey,
          matchData: {
            date: match.date,
            team: match.team,
            opponent: match.opponent,
            cprScore: cprScore,
            opponentScore: opponentScore,
            gameweek: match.gameweek,
            matchSummary: matchSummary || undefined,
          },
          players: playersArray,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit match data');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit match data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatSection = (
    title: string,
    entries: StatEntry[],
    setter: React.Dispatch<React.SetStateAction<StatEntry[]>>,
    withQuantity: boolean = false
  ) => {
    return (
      <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">{title}</h4>
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div key={index} className="flex gap-2">
              {!entry.isCustom ? (
                <select
                  value={entry.player}
                  onChange={(e) => updateEntry(setter, index, 'player', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-600 text-gray-100 rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select player...</option>
                  {matchPlayers.map(player => (
                    <option key={player} value={player}>{player}</option>
                  ))}
                  <option value="OTHER">Other (type name)</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={entry.player}
                  onChange={(e) => updateEntry(setter, index, 'player', e.target.value)}
                  placeholder="Enter player name"
                  className="flex-1 px-3 py-2 bg-slate-600 text-gray-100 rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
                />
              )}
              {withQuantity && (
                <input
                  type="number"
                  min="1"
                  value={entry.quantity || 1}
                  onChange={(e) => updateEntry(setter, index, 'quantity', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 bg-slate-600 text-gray-100 rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
                />
              )}
              <button
                type="button"
                onClick={() => removeEntry(setter, index)}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addEntry(setter, withQuantity)}
            className="w-full py-2 bg-slate-600 text-gray-300 rounded border border-slate-500 hover:bg-slate-500"
          >
            + Add Player
          </button>
        </div>
      </div>
    );
  };

  const renderSingleSelect = (
    title: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    useMatchPlayers: boolean = true
  ) => {
    const availablePlayers = useMatchPlayers ? matchPlayers : allPlayers;

    return (
      <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">{title}</h4>
        <select
          value={value}
          onChange={(e) => setter(e.target.value)}
          className="w-full px-3 py-2 bg-slate-600 text-gray-100 rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select player...</option>
          {availablePlayers.map(player => (
            <option key={player} value={player}>{player}</option>
          ))}
        </select>
      </div>
    );
  };

  if (loadingPlayers) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-8">
          <div className="text-gray-100">Loading players...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Submit Match Data</h2>
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

        {/* Overwrite Warning */}
        {showOverwriteWarning && (
          <div className="m-6 mb-0 bg-yellow-900/30 border-2 border-yellow-600 rounded-lg p-4">
            <h3 className="text-lg font-bold text-yellow-500 mb-2">⚠️ Hold up, slug!</h3>
            <p className="text-yellow-200">
              Match data has already been submitted. If you proceed, you'll overwrite the existing submission.
              Kangaroo court awaits for false submissions! 🦘⚖️
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="m-6 mb-0 bg-red-900/30 border border-red-600 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Scoreline */}
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Final Scoreline</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">{match.team}</label>
                  <input
                    type="number"
                    min="0"
                    value={cprScore}
                    onChange={(e) => setCprScore(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-600 text-gray-100 rounded border border-slate-500 focus:border-blue-500 focus:outline-none text-center text-2xl font-bold"
                  />
                </div>
                <div className="text-2xl text-gray-400 font-bold">-</div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">{match.opponent}</label>
                  <input
                    type="number"
                    min="0"
                    value={opponentScore}
                    onChange={(e) => setOpponentScore(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-600 text-gray-100 rounded border border-slate-500 focus:border-blue-500 focus:outline-none text-center text-2xl font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Match Summary */}
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                Match Summary (Optional)
              </h4>
              <p className="text-xs text-gray-400 mb-2">
                Write a brief summary of the match to generate an AI match report for Instagram
              </p>
              <textarea
                value={matchSummary}
                onChange={(e) => setMatchSummary(e.target.value)}
                placeholder="e.g., Hard-fought game against a nasty team of slugs, Albert's 3 foul throws a real low point even though Reece fought a spectator to prove he was related to Braveheart."
                rows={4}
                className="w-full px-3 py-2 bg-slate-600 text-gray-100 rounded border border-slate-500 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Goals */}
            {renderStatSection('Goals', goals, setGoals, true)}

            {/* Assists */}
            {renderStatSection('Assists', assists, setAssists, true)}

            {/* Yellow Cards */}
            {renderStatSection('Yellow Cards', yellowCards, setYellowCards, false)}

            {/* Red Cards */}
            {renderStatSection('Red Cards', redCards, setRedCards, false)}

            {/* Dick of Day - any player from full list */}
            {renderSingleSelect('Dick of the Day', dod, setDod, false)}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isSubmitting ? 'Submitting...' : showOverwriteWarning ? 'Confirm & Overwrite' : 'Submit Match Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
