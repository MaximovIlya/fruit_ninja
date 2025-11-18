import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from './hooks/useGame';
import { useCamera } from './hooks/useCamera';
import './FruitNinjaGame.css';
import { useViewportSize } from './hooks/useViewportSize';
import { Menu } from './app/components/Menu';
import './app/components/Menu.css';
import { useHandTracking } from './hooks/useHandTracking';
import { HandTrackingSystem } from './ecs/systems/HandTrackingSystem';
import { INITIAL_LIVES } from './config';
import { GameOver } from './app/components/GameOver';

enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  GAME_OVER = 'game_over'
}

export const FruitNinjaGame: React.FC = () => {
  const { videoRef, isLoading, error } = useCamera();
  const viewportRef = useRef<HTMLDivElement>(null);
  const dimensions = useViewportSize(viewportRef);
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [handTrackingSystem, setHandTrackingSystem] = useState<HandTrackingSystem | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);

  const { initializeHandTracking, disposeHandTracking } = useHandTracking(dimensions.width, dimensions.height);

  useEffect(() => {
    if (videoRef.current && dimensions.width > 0 && dimensions.height > 0) {
      initializeHandTracking(videoRef.current).then(system => {
        setHandTrackingSystem(system);
      });
    }

    return () => {
        disposeHandTracking();
    }
  }, [videoRef, dimensions, initializeHandTracking, disposeHandTracking]);


  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.GAME_OVER);
  }, [setScore, setGameState]);

  const { canvasRef, gameRef } = useGame(
    handTrackingSystem,
    dimensions.width,
    dimensions.height,
    {
      onScoreChange: setScore,
      onLivesChange: setLives,
      onGameOver: handleGameOver
    }
  );

  const handleStartGame = () => {
    if (gameRef.current) {
        setScore(0);
        setLives(INITIAL_LIVES);
        gameRef.current.startGame();
        setGameState(GameState.PLAYING);
    }
  };

  useEffect(() => {
    const handlePinch = () => {
        if (gameState === GameState.MENU || gameState === GameState.GAME_OVER) {
            handleStartGame();
        }
    };

    window.addEventListener('pinch', handlePinch);

    return () => {
        window.removeEventListener('pinch', handlePinch);
    };
  }, [gameState, gameRef]);

  return (
    <div className="game-container">
      {isLoading && <div className="loading">Loading camera...</div>}
      {error && <div className="error">{error}</div>}
      
      <div 
        ref={viewportRef}
        className="game-viewport"
      >
        <video
          ref={videoRef}
          className="camera-feed"
          width={"100vw"}
          height={"100vh"}
          autoPlay
          muted
        />
        <canvas
            ref={canvasRef}
            className="game-canvas"
            width={dimensions.width}
            height={dimensions.height}
        />
        {gameState === GameState.PLAYING && (
          <div className="game-hud">
            <div className="hud-item">
              Счёт: {score}
            </div>
            <div className="hud-item">
              Жизни: {lives}
            </div>
          </div>
        )}
        {gameState === GameState.MENU && <Menu onStartGame={handleStartGame} />}
        {gameState === GameState.GAME_OVER && (
          <GameOver score={score} onRestart={handleStartGame} />
        )}
      </div>
    </div>
  );
};

