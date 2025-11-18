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
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            All Teams
          </button>
          <button
            onClick={() => setTeamFilter('CPR')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation ${
              teamFilter === 'CPR'
                ? 'bg-navy text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            CPR
          </button>
          <button
            onClick={() => setTeamFilter('CPRA')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation ${
              teamFilter === 'CPRA'
                ? 'bg-navy text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            CPRA
          </button>
        </div>
      </div>

      {/* Season Stats Summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center">
          <div className="text-4xl font-bold text-slate-100 tabular-nums">{filteredMatches.length}</div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-2 font-semibold">Played</div>
        </div>
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-3 text-center">
          <div className="text-4xl font-bold text-green-700 tabular-nums">{wins}</div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-2 font-semibold">Wins</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
          <div className="text-4xl font-bold text-gray-300 tabular-nums">{draws}</div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-2 font-semibold">Draws</div>
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-center">
          <div className="text-4xl font-bold text-red-700 tabular-nums">{losses}</div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-2 font-semibold">Losses</div>
        </div>
      </div>

      {/* Match Cards */}
      <div className="space-y-3">
        {filteredMatches.map((match, index) => (
          <MatchCard key={`${match.date}-${match.opponent}-${index}`} match={match} />
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-sm text-gray-500 text-center font-light">
        <p>Tap any match to view player performances and stats</p>
        <p className="mt-1">Data updates automatically on page refresh</p>
      </div>
    </>
  );
}
