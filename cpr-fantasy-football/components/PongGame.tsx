'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface PongGameProps {
  onGameOver: () => void;
}

export default function PongGame({ onGameOver }: PongGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const gameStateRef = useRef({
    ball: { x: 400, y: 300, dx: 4, dy: 4, radius: 8 },
    paddle: { x: 350, y: 550, width: 100, height: 12 },
    bricks: [] as { x: number; y: number; width: number; height: number; visible: boolean }[],
    animationId: 0,
    keys: { left: false, right: false },
    gameOver: false,
  });

  const initBricks = useCallback(() => {
    const bricks = [];
    const rows = 5;
    const cols = 8;
    const brickWidth = 90;
    const brickHeight = 20;
    const padding = 10;
    const offsetX = 30;
    const offsetY = 50;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        bricks.push({
          x: offsetX + col * (brickWidth + padding),
          y: offsetY + row * (brickHeight + padding),
          width: brickWidth,
          height: brickHeight,
          visible: true,
        });
      }
    }
    return bricks;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();

    // Draw paddle
    ctx.fillStyle = '#fff';
    ctx.fillRect(state.paddle.x, state.paddle.y, state.paddle.width, state.paddle.height);

    // Draw bricks
    state.bricks.forEach((brick) => {
      if (brick.visible) {
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });

    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText(`Score: ${score}`, 10, 25);
  }, [score]);

  const update = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = gameStateRef.current;

    // Move paddle
    if (state.keys.left && state.paddle.x > 0) {
      state.paddle.x -= 7;
    }
    if (state.keys.right && state.paddle.x + state.paddle.width < canvas.width) {
      state.paddle.x += 7;
    }

    // Move ball
    state.ball.x += state.ball.dx;
    state.ball.y += state.ball.dy;

    // Ball collision with walls
    if (state.ball.x + state.ball.radius > canvas.width || state.ball.x - state.ball.radius < 0) {
      state.ball.dx = -state.ball.dx;
    }
    if (state.ball.y - state.ball.radius < 0) {
      state.ball.dy = -state.ball.dy;
    }

    // Ball collision with paddle
    if (
      state.ball.y + state.ball.radius > state.paddle.y &&
      state.ball.x > state.paddle.x &&
      state.ball.x < state.paddle.x + state.paddle.width
    ) {
      state.ball.dy = -state.ball.dy;
      // Add some angle based on where the ball hits the paddle
      const hitPos = (state.ball.x - state.paddle.x) / state.paddle.width;
      state.ball.dx = (hitPos - 0.5) * 8;
    }

    // Ball collision with bricks
    state.bricks.forEach((brick) => {
      if (brick.visible) {
        if (
          state.ball.x > brick.x &&
          state.ball.x < brick.x + brick.width &&
          state.ball.y > brick.y &&
          state.ball.y < brick.y + brick.height
        ) {
          state.ball.dy = -state.ball.dy;
          brick.visible = false;
          setScore((prev) => prev + 10);
        }
      }
    });

    // Game over if ball falls off bottom
    if (state.ball.y + state.ball.radius > canvas.height) {
      state.gameOver = true;
      cancelAnimationFrame(state.animationId);
      setTimeout(() => {
        onGameOver();
      }, 500);
      return;
    }
  }, [onGameOver]);

  const gameLoop = useCallback(() => {
    const state = gameStateRef.current;
    if (state.gameOver) return;

    update();
    draw();
    state.animationId = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  useEffect(() => {
    const state = gameStateRef.current;
    state.bricks = initBricks();
    state.gameOver = false;
    state.animationId = requestAnimationFrame(gameLoop);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') state.keys.left = true;
      if (e.key === 'ArrowRight') state.keys.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') state.keys.left = false;
      if (e.key === 'ArrowRight') state.keys.right = false;
    };

    // Mouse/touch controls
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      let clientX: number;

      if (e instanceof MouseEvent) {
        clientX = e.clientX;
      } else {
        clientX = e.touches[0].clientX;
      }

      const x = clientX - rect.left;
      state.paddle.x = Math.max(0, Math.min(x - state.paddle.width / 2, canvas.width - state.paddle.width));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);

    return () => {
      cancelAnimationFrame(state.animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
    };
  }, [gameLoop, initBricks]);

  return (
    <div className="flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border-4 border-white rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="mt-4 text-white text-center">
        <p className="text-sm">Use arrow keys or mouse/touch to move the paddle</p>
        <p className="text-xs opacity-75 mt-1">Don&apos;t let the ball fall!</p>
      </div>
    </div>
  );
}
