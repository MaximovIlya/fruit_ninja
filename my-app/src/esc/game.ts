export interface Fruit {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'apple' | 'orange' | 'banana' | 'watermelon';
  size: number;
  isCut: boolean;
  cutTime?: number;
}

export interface GameState {
  score: number;
  gameStarted: boolean;
  gameOver: boolean;
  lives: number;
}
