'use client';

import { useState } from 'react';
import { Match } from '@/lib/match-processor';
import MatchCard from './MatchCard';

interface MatchesViewProps {
  matches: Match[];
}

export default function MatchesView({ matches }: MatchesViewProps) {
  const [teamFilter, setTeamFilter] = useState<'All' | 'CPR' | 'CPRA'>('All');

  // Filter matches by team
  const filteredMatches = teamFilter === 'All'
    ? matches
    : matches.filter(m => m.team === teamFilter);

  // Calculate stats based on filtered matches
  const wins = filteredMatches.filter(m => m.cprScore > m.opponentScore).length;
  const draws = filteredMatches.filter(m => m.cprScore === m.opponentScore).length;
  const losses = filteredMatches.filter(m => m.cprScore < m.opponentScore).length;

  return (
    <>
      {/* Team Filter */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setTeamFilter('All')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation ${
              teamFilter === 'All'
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Teams
          </button>
          <button
            onClick={() => setTeamFilter('CPR')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation ${
              teamFilter === 'CPR'
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            CPR
          </button>
          <button
            onClick={() => setTeamFilter('CPRA')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation ${
              teamFilter === 'CPRA'
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            CPRA
          </button>
        </div>
      </div>

      {/* Season Stats Summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-navy">{filteredMatches.length}</div>
          <div className="text-xs text-gray-600 mt-1">Played</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-700">{wins}</div>
          <div className="text-xs text-gray-600 mt-1">Wins</div>
        </div>
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-700">{draws}</div>
          <div className="text-xs text-gray-600 mt-1">Draws</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{losses}</div>
          <div className="text-xs text-gray-600 mt-1">Losses</div>
        </div>
      </div>

      {/* Match Cards */}
      <div className="space-y-3">
        {filteredMatches.map((match, index) => (
          <MatchCard key={`${match.date}-${match.opponent}-${index}`} match={match} />
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>Tap any match to view player performances and stats</p>
        <p className="mt-1">Data updates automatically on page refresh</p>
      </div>
    </>
  );
}
