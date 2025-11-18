'use client';

import { useState, useCallback, useEffect } from 'react';

interface PongGameProps {
  onGameOver: () => void;
}

type GameState = 'start' | 'waiting' | 'ready' | 'playing' | 'victory' | 'defeat';

export default function PongGame({ onGameOver }: PongGameProps) {
  const [gameState, setGameState] = useState<GameState>('start');
  const [round, setRound] = useState(1);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentStartTime, setCurrentStartTime] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [waitTime, setWaitTime] = useState(2000);

  const startGame = useCallback(() => {
    setGameState('waiting');
    setRound(1);
    setReactionTimes([]);
    setMessage('Get Ready...');

    // Random wait time before showing green
    const randomWait = Math.random() * 2000 + 1000; // 1-3 seconds
    setWaitTime(randomWait);

    setTimeout(() => {
      setGameState('ready');
      setMessage('CLICK NOW!');
      setCurrentStartTime(Date.now());
    }, randomWait);
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === 'ready') {
      const reactionTime = Date.now() - currentStartTime;
      const newReactionTimes = [...reactionTimes, reactionTime];
      setReactionTimes(newReactionTimes);

      if (round >= 10) {
        // Game over - calculate average
        const average = newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length;

        if (average < 300) {
          setGameState('victory');
          setMessage(`Amazing! Average: ${Math.round(average)}ms`);
          setTimeout(() => onGameOver(), 2000);
        } else {
          setGameState('defeat');
          setMessage(`Too slow! Average: ${Math.round(average)}ms`);
          setTimeout(() => onGameOver(), 2000);
        }
      } else {
        // Next round
        setRound(round + 1);
        setGameState('waiting');
        setMessage(`Round ${round + 1} - Get Ready...`);

        // Each round gets slightly faster
        const randomWait = Math.random() * 1500 + 500 + (1000 - round * 50);
        setWaitTime(randomWait);

        setTimeout(() => {
          setGameState('ready');
          setMessage('CLICK NOW!');
          setCurrentStartTime(Date.now());
        }, randomWait);
      }
    } else if (gameState === 'waiting') {
      // Clicked too early
      setGameState('defeat');
      setMessage('Too early! You lose!');
      setTimeout(() => onGameOver(), 2000);
    }
  }, [gameState, currentStartTime, reactionTimes, round, onGameOver]);

  const getCircleColor = () => {
    if (gameState === 'start') return 'bg-gray-400';
    if (gameState === 'waiting') return 'bg-red-500';
    if (gameState === 'ready') return 'bg-green-500';
    if (gameState === 'victory') return 'bg-yellow-400';
    if (gameState === 'defeat') return 'bg-red-600';
    return 'bg-gray-400';
  };

  const getLastReactionTime = () => {
    if (reactionTimes.length === 0) return null;
    return reactionTimes[reactionTimes.length - 1];
  };

  return (
    <div className="flex flex-col items-center justify-center relative bg-black p-8 rounded-lg min-h-[600px]">
      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Reaction Time Challenge</h2>
          <p className="text-white mb-6">Click the circle as fast as you can when it turns GREEN</p>
          <p className="text-yellow-400 mb-6 text-lg">⚠️ Don&apos;t click when it&apos;s RED or you lose!</p>
          <p className="text-white mb-6">Complete 10 rounds with average under 300ms to win</p>
          <button
            onClick={startGame}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-2xl rounded-lg transition-colors"
          >
            Start
          </button>
        </div>
      )}

      {/* Playing */}
      {(gameState === 'waiting' || gameState === 'ready') && (
        <div className="text-center">
          <div className="mb-6">
            <p className="text-white text-xl mb-2">Round {round}/10</p>
            <p className="text-white text-lg">{message}</p>
            {getLastReactionTime() && (
              <p className="text-gray-400 text-sm mt-2">
                Last: {getLastReactionTime()}ms
              </p>
            )}
          </div>

          <button
            onClick={handleClick}
            className={`${getCircleColor()} w-64 h-64 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer border-4 border-white flex items-center justify-center`}
          >
            <span className="text-white text-2xl font-bold">
              {gameState === 'ready' ? 'CLICK!' : 'WAIT...'}
            </span>
          </button>

          {reactionTimes.length > 0 && (
            <div className="mt-6">
              <p className="text-gray-400 text-sm">
                Average: {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms
              </p>
            </div>
          )}
        </div>
      )}

      {/* Victory */}
      {gameState === 'victory' && (
        <div className="text-center">
          <div className={`${getCircleColor()} w-64 h-64 rounded-full mx-auto mb-6 flex items-center justify-center`}>
            <span className="text-6xl">🎉</span>
          </div>
          <h2 className="text-5xl font-bold text-yellow-400 mb-4">You Win!</h2>
          <p className="text-white text-2xl mb-2">{message}</p>
          <p className="text-gray-400 text-sm mt-4">Revealing fines...</p>
        </div>
      )}

      {/* Defeat */}
      {gameState === 'defeat' && (
        <div className="text-center">
          <div className={`${getCircleColor()} w-64 h-64 rounded-full mx-auto mb-6 flex items-center justify-center`}>
            <span className="text-6xl">😢</span>
          </div>
          <h2 className="text-5xl font-bold text-red-400 mb-4">Game Over</h2>
          <p className="text-white text-2xl mb-2">{message}</p>
          <p className="text-gray-400 text-sm mt-4">Revealing fines...</p>
        </div>
      )}
    </div>
  );
}
