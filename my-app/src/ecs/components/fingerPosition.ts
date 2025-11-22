import type { Position } from './position';

export type FingerPosition = Position & {
  visibility: number;
  id: string;
};

export type FingerPositions = {
  landmarks: FingerPosition[];
};
