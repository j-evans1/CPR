'use client';

import { useState } from 'react';
import { FantasyTeam } from '@/lib/fantasy-processor';

interface TeamCardProps {
  team: FantasyTeam;
  index: number;
}

export default function TeamCard({ team, index }: TeamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getRowColors = () => {
    if (index === 0) return 'border-yellow-500 bg-yellow-600/20'; // Gold
    if (index === 1) return 'border-gray-300 bg-gray-400/30'; // Silver - brighter and more prominent
    if (index === 2) return 'border-amber-700 bg-amber-800/20'; // Bronze
    return 'border-slate-700 bg-slate-800';
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${getRowColors()}`}
    >
      {/* Team Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-slate-700 transition-colors touch-manipulation"
      >
        <div className="flex items-center space-x-3 flex-1">
          <div className="text-xl font-bold text-white min-w-[2.5rem]">
            {getRankBadge(team.rank || index + 1)}
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold text-gray-100">{team.teamName}</div>
            <div className="text-sm text-gray-500">Manager: {team.managerName}</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-xl font-bold text-white tabular-nums">{team.totalPoints}</div>
            <div className="text-xs text-gray-500">points</div>
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

      {/* Team Roster - Expandable */}
      {isExpanded && (
        <div className="border-t border-slate-700 bg-slate-700">
          <div className="p-3">
            <h4 className="font-semibold text-xs text-gray-300 mb-2 uppercase tracking-wide">
              Team
            </h4>
            <div className="space-y-1">
              {team.players.map((player, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-slate-600 rounded shadow-sm"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-100">{player.name}</div>
                    <div className="text-xs text-gray-500">{player.position}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm text-white tabular-nums">{player.points}</div>
                    <div className="text-xs text-gray-500">pts</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-600 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">Total Team Points</span>
              <span className="text-lg font-bold text-white tabular-nums">{team.totalPoints}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
