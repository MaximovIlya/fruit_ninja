import React, { useEffect, useRef } from 'react';
import { useCanvasAnimation } from './hooks/useCanvasAnimation';
import { useCamera } from './hooks/useCamera';
import './FruitNinjaGame.css';
import { useViewportSize } from './hooks/useViewportSize';

export const FruitNinjaGame: React.FC = () => {
  const { videoRef, isLoading, error } = useCamera();
  const viewportRef = useRef<HTMLDivElement>(null);
  const dimensions = useViewportSize(viewportRef);

  const { canvasRef } = useCanvasAnimation(videoRef, dimensions.width, dimensions.height);

  useEffect(() => {
    const handlePinchClick = () => {
      console.log('clicked');
    };

    window.addEventListener('pinchclick', handlePinchClick);

    return () => {
      window.removeEventListener('pinchclick', handlePinchClick);
    };
  }, []);

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
      </div>
    </div>
  );
};
