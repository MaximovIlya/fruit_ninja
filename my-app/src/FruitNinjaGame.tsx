import React from 'react';
import { useCanvasAnimation } from './hooks/useCanvasAnimation';
import { useCamera } from './hooks/useCamera';
import './FruitNinjaGame.css';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './config';

export const FruitNinjaGame: React.FC = () => {
  const { canvasRef } = useCanvasAnimation();
  const { videoRef, isLoading, error } = useCamera();

  return (
    <div className="game-container">
      {isLoading && <div className="loading">Loading camera...</div>}
      {error && <div className="error">{error}</div>}
      
      <div 
        className="game-viewport"
        // style={{width: `${CANVAS_WIDTH}px`, height: `${480}px`}}
      >
        <video
          ref={videoRef}
          className="camera-feed"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          autoPlay
          muted
        />
        <canvas
          ref={canvasRef}
          className="game-canvas"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
        />
      </div>
    </div>
  );
};
