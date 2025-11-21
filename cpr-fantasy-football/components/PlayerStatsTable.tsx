'use client';

import { useState } from 'react';
import { PlayerStat } from '@/lib/types';
import { Match } from '@/lib/match-processor';

interface PlayerStatsTableProps {
  playerStats: PlayerStat[];
  matches: Match[];
}

interface PlayerGame {
  date: string;
  opponent: string;
  score: string;
  goals: number;
  assists: number;
  points: number;
}

export default function PlayerStatsTable({ playerStats, matches }: PlayerStatsTableProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showJokeMessage, setShowJokeMessage] = useState(false);

  const handlePlayerClick = (playerName: string) => {
    if (playerName === 'S. Edwards') {
      setShowJokeMessage(true);
    } else {
      setSelectedPlayer(playerName);
    }
  };

  const handleJokeOk = () => {
    setShowJokeMessage(false);
    setSelectedPlayer('S. Edwards');
  };

  const getPlayerGames = (playerName: string): PlayerGame[] => {
    const games: PlayerGame[] = [];

    matches.forEach(match => {
      const playerPerformance = match.players.find(p => p.name === playerName);
      if (playerPerformance) {
        games.push({
          date: match.date,
          opponent: match.opponent,
          score: match.score,
          goals: playerPerformance.goals,
          assists: playerPerformance.assists,
          points: playerPerformance.points,
        });
      }
    });

    return games;
  };

  const selectedPlayerData = playerStats.find(p => p.name === selectedPlayer);
  const playerGames = selectedPlayer ? getPlayerGames(selectedPlayer) : [];
  const totalPoints = selectedPlayerData?.fantasyPoints || 0;

  return (
    <>
      <div className="overflow-x-auto shadow-lg rounded-lg border border-slate-700">
        <table className="min-w-full bg-slate-800">
          <thead className="bg-navy text-white">
            <tr>
              <th className="px-3 md:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider sticky left-0 z-10 bg-navy w-12 md:w-auto">Rank</th>
              <th className="px-3 md:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider sticky left-[48px] md:left-[72px] z-10 bg-navy">Player</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Apps</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Goals</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Assists</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Clean Sheets</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">MoM 1</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">MoM 2</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">MoM 3</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">DoD</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Yellow Cards</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Red Cards</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider bg-navy/90">Fantasy Points</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider bg-navy/90">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {playerStats.map((player, index) => {
              const getRowColors = () => {
                if (index === 0) return { bg: 'bg-yellow-600/30', sticky: 'bg-yellow-600' }; // Gold
                if (index === 1) return { bg: 'bg-gray-700/50', sticky: 'bg-gray-700' }; // Silver
                if (index === 2) return { bg: 'bg-amber-900/40', sticky: 'bg-amber-900' }; // Bronze
                return { bg: 'bg-slate-800', sticky: 'bg-slate-800' };
              };
              const colors = getRowColors();

              return (
                <tr
                  key={player.name}
                  className={`hover:bg-slate-700 transition-colors ${colors.bg}`}
                >
                  <td className={`px-2 md:px-6 py-4 text-base md:text-lg font-bold text-gray-100 sticky left-0 z-10 ${colors.sticky} w-12 md:w-auto`}>
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && index + 1}
                  </td>
                  <td className={`px-3 md:px-6 py-4 text-sm md:text-base font-semibold text-gray-100 sticky left-[48px] md:left-[72px] z-10 tracking-wide ${colors.sticky}`}>
                    {player.name}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.appearances}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.goals}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.assists}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.cleanSheets}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.mom1}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.mom2}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.mom3}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.dod}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.yellowCards}
                  </td>
                  <td className="px-6 py-4 text-base text-center text-gray-300 font-light tabular-nums">
                    {player.redCards}
                  </td>
                  <td className="px-6 py-4 text-xl text-center font-bold text-navy bg-gray-50 tabular-nums">
                    {player.fantasyPoints}
                  </td>
                  <td className="px-6 py-4 text-center bg-gray-50">
                    <button
                      onClick={() => handlePlayerClick(player.name)}
                      className="text-navy hover:text-blue-700 transition-colors"
                      title="View player details"
                    >
                      <svg
                        className="w-5 h-5 inline-block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* S. Edwards Joke Modal */}
      {showJokeMessage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowJokeMessage(false)}>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-red-400 mb-4">Point Deduction</h3>
              <p className="text-gray-100 text-lg mb-6">You have been deducted 1 point</p>
              <button
                onClick={handleJokeOk}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Details Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPlayer(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-100">{selectedPlayer}</h3>
                <p className="text-gray-400 mt-1">Season 2025/26 Performance</p>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Total Points Card */}
            <div className="bg-navy rounded-lg p-4 mb-6 text-center">
              <div className="text-sm uppercase tracking-wider text-gray-300 mb-2">Total Fantasy Points</div>
              <div className="text-5xl font-bold text-white tabular-nums">{totalPoints}</div>
            </div>

            {/* Games Table */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-100 mb-4">Match History</h4>
              {playerGames.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No match data available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-slate-600">
                        <th className="text-left py-2 px-2">Date</th>
                        <th className="text-left py-2 px-2">Opponent</th>
                        <th className="text-center py-2 px-2">Score</th>
                        <th className="text-center py-2 px-2">Goals</th>
                        <th className="text-center py-2 px-2">Assists</th>
                        <th className="text-center py-2 px-2">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerGames.map((game, idx) => (
                        <tr key={idx} className="border-b border-slate-600 hover:bg-slate-600/50">
                          <td className="py-2 px-2 text-gray-100">{game.date}</td>
                          <td className="py-2 px-2 text-gray-100">{game.opponent}</td>
                          <td className="text-center py-2 px-2 text-gray-300 font-semibold">{game.score}</td>
                          <td className="text-center py-2 px-2 text-gray-300">{game.goals}</td>
                          <td className="text-center py-2 px-2 text-gray-300">{game.assists}</td>
                          <td className="text-center py-2 px-2 text-white font-bold tabular-nums">{game.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
