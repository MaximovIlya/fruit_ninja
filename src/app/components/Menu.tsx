import React, { useRef, type RefObject } from 'react';
import { usePinchToClick } from '../../hooks/gestures/usePinchToClick';

interface MenuProps {
  onStartGame: () => void;
}

export const Menu: React.FC<MenuProps> = ({ onStartGame }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  usePinchToClick(buttonRef as RefObject<HTMLElement>, onStartGame);

  return (
    <div className="menu">
      <h1>Fruit Ninja</h1>
      <button ref={buttonRef} onClick={onStartGame}>Start Game</button>
    </div>
  );
}; 