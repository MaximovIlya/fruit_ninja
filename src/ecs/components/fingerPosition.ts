import type { Position } from './position';

export type FingerPosition = Position & {
  visibility: number;
  id: string;
};

export type Edge = {
  startIndex: number;
  endIndex: number;
  handIndex: number;
}

export type FingerPositions = {
  landmarks: FingerPosition[];
  edges: Edge[];
};
