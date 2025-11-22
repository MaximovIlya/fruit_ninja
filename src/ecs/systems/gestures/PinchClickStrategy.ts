import type { NormalizedLandmarkList } from '@mediapipe/hands';
import type { GestureStrategy } from './GestureStrategy';

export class PinchClickStrategy implements GestureStrategy {
  private isPinched = false;
  private readonly PINCH_THRESHOLD = 30;

  update(landmarks: NormalizedLandmarkList, canvasWidth: number, canvasHeight: number): void {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    if (thumbTip && indexTip) {
      const distance = Math.sqrt(
        Math.pow((thumbTip.x - indexTip.x) * canvasWidth, 2) +
          Math.pow((thumbTip.y - indexTip.y) * canvasHeight, 2)
      );

      if (distance < this.PINCH_THRESHOLD) {
        if (!this.isPinched) {
          this.isPinched = true;
          window.dispatchEvent(new CustomEvent('pinchclick'));
        }
      } else {
        this.isPinched = false;
      }
    }
  }
} 