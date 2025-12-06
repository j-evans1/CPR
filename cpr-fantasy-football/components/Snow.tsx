'use client';

import { useEffect, useState } from 'react';

export default function Snow() {
  const [mounted, setMounted] = useState(false);
  const [snowflakes, setSnowflakes] = useState<Array<{
    id: number;
    left: number;
    duration: number;
    delay: number;
    size: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    setMounted(true);

    const flakes = [];
    const numFlakes = 50;

    for (let i = 0; i < numFlakes; i++) {
      flakes.push({
        id: i,
        left: Math.random() * 100,
        duration: 5 + Math.random() * 10,
        delay: Math.random() * 5,
        size: 2 + Math.random() * 4,
        opacity: 0.3 + Math.random() * 0.7,
      });
    }

    setSnowflakes(flakes);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .snowflake {
            position: fixed;
            top: -10px;
            background: white;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: fall linear infinite;
          }

          @keyframes fall {
            0% {
              transform: translateY(-10px);
            }
            100% {
              transform: translateY(100vh);
            }
          }
        `
      }} />
      <div className="snow-container pointer-events-none">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="snowflake"
            style={{
              left: `${flake.left}%`,
              animationDuration: `${flake.duration}s`,
              animationDelay: `${flake.delay}s`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
            }}
          />
        ))}
      </div>
    </>
  );
}
