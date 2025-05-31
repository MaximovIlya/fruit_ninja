import React, { useEffect, useRef } from 'react';
import { Game } from './Game';

export const FruitNinjaGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new Game(canvas);
    game.spawnFruit();
    gameRef.current = game;

    const gameLoop = () => {
      game.update();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div>
      <h1>Fruit Ninja ECS</h1>
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
};
