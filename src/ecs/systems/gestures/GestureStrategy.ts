import type { NormalizedLandmarkList } from '@mediapipe/hands';

export interface GestureStrategy {
  update(landmarks: NormalizedLandmarkList, canvasWidth: number, canvasHeight: number): void;
} 