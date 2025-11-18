import React, { useRef, type RefObject } from 'react';
import { usePinchToClick } from '../../hooks/gestures/usePinchToClick';
import './GameOver.css';

interface GameOverProps {
  score: number;
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ score, onRestart }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  usePinchToClick(buttonRef as RefObject<HTMLElement>, onRestart);

  return (
    <div className="game-over">
      <h1>You Lose!</h1>
      <div className="score-display-final">
        <p>Your Score:</p>
        <p className="score-value">{score}</p>
      </div>
      <button ref={buttonRef} onClick={onRestart}>Play Again</button>
    </div>
  );
};

