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
          console.log('pinch');
          this.isPinched = true;
          const pinchX = ((thumbTip.x + indexTip.x) / 2) * canvasWidth;
          const pinchY = ((thumbTip.y + indexTip.y) / 2) * canvasHeight;
          window.dispatchEvent(new CustomEvent('pinch', { detail: { x: pinchX, y: pinchY } }));
        }
      } else {
        this.isPinched = false;
      }
    }
  }
} 