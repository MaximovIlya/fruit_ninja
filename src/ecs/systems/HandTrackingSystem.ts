import { Camera } from '@mediapipe/camera_utils';
import { Hands, type Results } from '@mediapipe/hands';
import type { FingerPositions } from '../components/fingerPosition';
import type { GestureStrategy } from './gestures/GestureStrategy';

export class HandTrackingSystem {
  private _hands: Hands;
  private _camera: Camera | null = null;
  private _videoElement: HTMLVideoElement | null = null;
  private _fingerPositions: FingerPositions = { landmarks: [], edges: [] };
  private _canvasWidth: number;
  private _canvasHeight: number;
  private _strategies: GestureStrategy[];

  private readonly HAND_CONNECTIONS = [
    [2, 3], [3, 4],     // Thumb
    [6, 7], [7, 8],     // Index finger
    [10, 11], [11, 12], // Middle finger
    [14, 15], [15, 16], // Ring finger
    [18, 19], [19, 20]  // Pinky
  ];

  constructor(canvasWidth: number, canvasHeight: number, strategies: GestureStrategy[]) {
    this._canvasWidth = canvasWidth;
    this._canvasHeight = canvasHeight;
    this._strategies = strategies;
    this._hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    this._hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this._hands.onResults(this.onResults.bind(this));
  }

  private onResults(results: Results): void {
    this._fingerPositions.landmarks = [];
    this._fingerPositions.edges = [];

    if (results.multiHandLandmarks) {
      const fingerLandmarkIndices = [2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15, 16, 18, 19, 20];

      for (let handIndex = 0; handIndex < results.multiHandLandmarks.length; handIndex++) {
        const landmarks = results.multiHandLandmarks[handIndex];
        
        for (const strategy of this._strategies) {
          strategy.update(landmarks, this._canvasWidth, this._canvasHeight);
        }
        
        const currentHandLandmarks = fingerLandmarkIndices.map((landmarkIndex) => {
          const landmark = landmarks[landmarkIndex]!;
          return {
            x: (1 - landmark.x) * this._canvasWidth, // Flip horizontally to fix mirroring
            y: landmark.y * this._canvasHeight,
            visibility: landmark.visibility || 1,
            id: `hand${handIndex}_landmark${landmarkIndex}`
          };
        });

        const landmarkOffset = this._fingerPositions.landmarks.length;
        this._fingerPositions.landmarks.push(...currentHandLandmarks);

        // Add edges for this hand
        this.HAND_CONNECTIONS.forEach(([start, end]) => {
          const startIndex = fingerLandmarkIndices.indexOf(start);
          const endIndex = fingerLandmarkIndices.indexOf(end);

          if (startIndex !== -1 && endIndex !== -1) {
            this._fingerPositions.edges.push({
              startIndex: landmarkOffset + startIndex,
              endIndex: landmarkOffset + endIndex,
              handIndex: handIndex
            });
          }
        });
      }
    }
  }

  async initializeCamera(videoElement: HTMLVideoElement): Promise<void> {
    this._videoElement = videoElement;
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

  get videoElement(): HTMLVideoElement | null {
    return this._videoElement;
  }

  dispose(): void {
    if (this._camera) {
      this._camera.stop();
    }
    this._hands.close();
  }
}
