import React from 'react';
import { useCanvasAnimation } from './hooks/useCanvasAnimation';

export const FruitNinjaGame: React.FC = () => {
  const {canvasRef} = useCanvasAnimation()

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
