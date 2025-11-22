import { Camera } from '@mediapipe/camera_utils';
import { Hands, type Results } from '@mediapipe/hands';
import type { FingerPositions } from '../components/fingerPosition';

export class HandTrackingSystem {
  private _hands: Hands;
  private _camera: Camera | null = null;
  private _fingerPositions: FingerPositions = { landmarks: [] };
  private _canvasWidth: number;
  private _canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this._canvasWidth = canvasWidth;
    this._canvasHeight = canvasHeight;
    this._hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    this._hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this._hands.onResults(this.onResults.bind(this));
  }

  private onResults(results: Results): void {
    this._fingerPositions.landmarks = [];
    
    if (results.multiHandLandmarks) {
      for (let handIndex = 0; handIndex < results.multiHandLandmarks.length; handIndex++) {
        const landmarks = results.multiHandLandmarks[handIndex];
        
        // Get fingertip landmarks (4, 8, 12, 16, 20 are fingertip indices)
        const fingertipIndices = [4, 8, 12, 16, 20];
        
        fingertipIndices.forEach((index, fingerIndex) => {
          const landmark = landmarks[index];
          if (landmark) {
            this._fingerPositions.landmarks.push({
              x: (1 - landmark.x) * this._canvasWidth, // Flip horizontally to fix mirroring
              y: landmark.y * this._canvasHeight,
              visibility: landmark.visibility || 1,
              id: `hand${handIndex}_finger${fingerIndex}`
            });
          }
        });
      }
    }
  }

  async initializeCamera(videoElement: HTMLVideoElement): Promise<void> {
    this._camera = new Camera(videoElement, {
      onFrame: async () => {
        await this._hands.send({ image: videoElement });
      },
      width: this._canvasWidth,
      height: this._canvasHeight
    });
    
    await this._camera.start();
  }

  get fingerPositions(): FingerPositions {
    return this._fingerPositions;
  }

  dispose(): void {
    if (this._camera) {
      this._camera.stop();
    }
    this._hands.close();
  }
}
