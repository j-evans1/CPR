'use client';

import { useState } from 'react';
import PongGame from './PongGame';

export default function Footer() {
  const [showModal, setShowModal] = useState(false);
  const [answer, setAnswer] = useState('');
  const [showGame, setShowGame] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedAnswer = answer.toLowerCase().trim();

    if (normalizedAnswer.includes('evans')) {
      // Correct answer - redirect to YouTube
      window.location.href = 'https://www.youtube.com/watch?v=0kBrbDf0siw';
    } else {
      // Wrong answer - launch the game
      setShowModal(false);
      setShowGame(true);
    }
  };

  const handleGameOver = () => {
    setShowGame(false);
    setAnswer('');
  };

  return (
    <>
      <footer className="bg-slate-900 border-t border-slate-700 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">
              © Clissold Park Rangers 2025
            </p>
            <p className="text-gray-500 text-xs mb-4">
              All stats are subject to being entirely wrong.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="text-gray-400 text-xs hover:text-gray-400 transition-colors underline"
            >
              Report an issue
            </button>
          </div>
        </div>
      </footer>

      {/* Complaint Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-slate-800 rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-slate-100">Report an Issue</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-400"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <p className="text-gray-300 mb-4">
              Before proceeding, please answer this important question:
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-slate-100 font-semibold mb-2">
                  Who won Goal of the Season in the 2024/25 season?
                </label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy text-slate-100 bg-slate-700"
                  placeholder="Enter your answer..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-navy text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Game Modal for Wrong Answer */}
      {showGame && (
        <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50">
          <div className="relative">
            <PongGame
              onGameOver={handleGameOver}
              customEndMessage="Stop being such a slug."
              requireClickToDismiss={true}
            />
          </div>
        </div>
      )}
    </>
  );
}
