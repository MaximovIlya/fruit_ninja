import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useHandTracking, type HandLandmark } from './hooks/useHandTracking';
import type { Fruit, GameState } from './esc/game';

const FRUIT_TYPES = ['apple', 'orange', 'banana', 'watermelon'] as const;
const FRUIT_COLORS = {
  apple: '#ff4444',
  orange: '#ff8844',
  banana: '#ffff44',
  watermelon: '#44ff44',
};

export const FruitNinjaGame: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  
  const handResults = useHandTracking(videoRef);
  
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    gameStarted: false,
    gameOver: false,
    lives: 3,
  });

  const generateFruit = useCallback((): Fruit => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Canvas not found');
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * canvas.width,
      y: canvas.height + 50,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 8 - 10,
      type: FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)],
      size: 30 + Math.random() * 20,
      isCut: false,
    };
  }, []);

  const checkCollision = useCallback((fruit: Fruit, landmarks: HandLandmark[][]): boolean => {
    const canvas = canvasRef.current;
    if (!canvas || landmarks.length === 0) return false;

    for (const handLandmarks of landmarks) {
      // Check index finger tip (landmark 8) and middle finger tip (landmark 12)
      const fingerTips = [handLandmarks[8], handLandmarks[12]];
      
      for (const landmark of fingerTips) {
        const handX = landmark.x * canvas.width;
        const handY = landmark.y * canvas.height;
        
        const distance = Math.sqrt(
          Math.pow(handX - fruit.x, 2) + Math.pow(handY - fruit.y, 2)
        );
        
        if (distance < fruit.size) {
          return true;
        }
      }
    }
    return false;
  }, []);

  const updateGame = useCallback(() => {
    if (!gameState.gameStarted || gameState.gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    setFruits(prevFruits => {
      const updatedFruits = prevFruits.map(fruit => {
        if (fruit.isCut) {
          return fruit;
        }

        // Check collision with hands
        if (checkCollision(fruit, handResults.landmarks)) {
          setGameState(prev => ({ ...prev, score: prev.score + 10 }));
          return { ...fruit, isCut: true, cutTime: Date.now() };
        }

        // Update position
        const newFruit = {
          ...fruit,
          x: fruit.x + fruit.vx,
          y: fruit.y + fruit.vy,
          vy: fruit.vy + 0.5, // gravity
        };

        // Check if fruit fell off screen
        if (newFruit.y > canvas.height + 100) {
          setGameState(prev => {
            const newLives = prev.lives - 1;
            return {
              ...prev,
              lives: newLives,
              gameOver: newLives <= 0,
            };
          });
          return null;
        }

        return newFruit;
      }).filter(Boolean) as Fruit[];

      // Remove cut fruits after animation
      const now = Date.now();
      return updatedFruits.filter(fruit => 
        !fruit.isCut || (fruit.cutTime && now - fruit.cutTime < 500)
      );
    });

    // Spawn new fruits randomly
    if (Math.random() < 0.02) {
      setFruits(prev => [...prev, generateFruit()]);
    }
  }, [gameState.gameStarted, gameState.gameOver, handResults.landmarks, checkCollision, generateFruit]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video feed
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw fruits
    fruits.forEach(fruit => {
      ctx.fillStyle = FRUIT_COLORS[fruit.type];
      ctx.beginPath();
      ctx.arc(fruit.x, fruit.y, fruit.size, 0, Math.PI * 2);
      ctx.fill();

      if (fruit.isCut) {
        // Draw cut effect
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fruit.x - fruit.size, fruit.y);
        ctx.lineTo(fruit.x + fruit.size, fruit.y);
        ctx.stroke();
      }
    });

    // Draw hand landmarks
    if (handResults.isDetected) {
      ctx.fillStyle = '#00ff00';
      handResults.landmarks.forEach(handLandmarks => {
        handLandmarks.forEach((landmark, index) => {
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;
          
          if (index === 8 || index === 12) { // finger tips
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });
    }
  }, [fruits, handResults]);

  const gameLoop = useCallback(() => {
    updateGame();
    drawGame();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, drawGame]);

  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gameOver, gameLoop]);

  const startGame = () => {
    setGameState({
      score: 0,
      gameStarted: true,
      gameOver: false,
      lives: 3,
    });
    setFruits([]);
  };

  return (
    <div className="fruit-ninja-game">
      <div className="game-ui">
        <div>Score: {gameState.score}</div>
        <div>Lives: {gameState.lives}</div>
        <div>Hands: {handResults.isDetected ? '✓' : '✗'}</div>
      </div>
      
      <div className="game-container">
        <video
          ref={videoRef}
          style={{ display: 'none' }}
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="game-canvas"
        />
      </div>

      {!gameState.gameStarted && (
        <div className="game-menu">
          <h1>Fruit Ninja CV</h1>
          <p>Use your hands to cut the fruits!</p>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}

      {gameState.gameOver && (
        <div className="game-menu">
          <h1>Game Over!</h1>
          <p>Final Score: {gameState.score}</p>
          <button onClick={startGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};
