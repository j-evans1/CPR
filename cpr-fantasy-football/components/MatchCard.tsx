'use client';

import { useState } from 'react';
import { Match } from '@/lib/match-processor';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
            <div className="font-semibold text-gray-100">
              {match.team} {match.score} {match.opponent}
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
          </div>
        </div>
      )}
    </div>
  );
}
