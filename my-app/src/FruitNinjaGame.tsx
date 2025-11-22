import React, { useEffect, useRef } from 'react';
import { Game } from './Game';

export const FruitNinjaGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const newMousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      if (gameRef.current) {
        gameRef.current.setMousePosition(newMousePos);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const game = new Game(canvas);
    game.spawnFruit();
    gameRef.current = game;

    const gameLoop = () => {
      game.update();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ border: '1px solid black', cursor: 'crosshair' }}
      />
    </div>
  );
};
