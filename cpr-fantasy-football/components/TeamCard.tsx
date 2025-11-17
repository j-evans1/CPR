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

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${
        index < 3 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'
      }`}
    >
      {/* Team Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors touch-manipulation"
      >
        <div className="flex items-center space-x-3 flex-1">
          <div className="text-2xl font-bold text-navy min-w-[2.5rem]">
            {getRankBadge(team.rank || index + 1)}
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold text-gray-900">{team.teamName}</div>
            <div className="text-sm text-gray-500">Manager: {team.managerName}</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-navy">{team.totalPoints}</div>
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
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wide">
              Team Roster
            </h4>
            <div className="space-y-2">
              {team.players.map((player, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{player.name}</div>
                    <div className="text-xs text-gray-500">{player.position}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-navy">{player.points}</div>
                    <div className="text-xs text-gray-500">pts</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Team Points</span>
              <span className="text-xl font-bold text-navy">{team.totalPoints}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
