import { Camera } from '@mediapipe/camera_utils';
import { Hands, type Results } from '@mediapipe/hands';
import type { FingerPositions } from '../components/fingerPosition';

export class HandTrackingSystem {
  private _hands: Hands;
  private _camera: Camera | null = null;
  private _fingerPositions: FingerPositions = { landmarks: [], edges: [] };
  private _canvasWidth: number;
  private _canvasHeight: number;

  // Hand landmark connections based on MediaPipe model
  private readonly HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],     // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],     // Index finger
    [5, 9], [9, 10], [10, 11], [11, 12], // Middle finger
    [9, 13], [13, 14], [14, 15], [15, 16], // Ring finger
    [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [0, 17] // Connect wrist to pinky base
  ];

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
    this._fingerPositions.edges = [];
    
    if (results.multiHandLandmarks) {
      for (let handIndex = 0; handIndex < results.multiHandLandmarks.length; handIndex++) {
        const landmarks = results.multiHandLandmarks[handIndex];
        
        // Get all hand landmarks (0-20)
        landmarks.forEach((landmark, landmarkIndex) => {
          if (landmark) {
            this._fingerPositions.landmarks.push({
              x: (1 - landmark.x) * this._canvasWidth, // Flip horizontally to fix mirroring
              y: landmark.y * this._canvasHeight,
              visibility: landmark.visibility || 1,
              id: `hand${handIndex}_landmark${landmarkIndex}`
            });
          }
        });

        // Add edges for this hand
        const handOffset = handIndex * 21; // 21 landmarks per hand
        this.HAND_CONNECTIONS.forEach(([start, end]) => {
          this._fingerPositions.edges.push({
            startIndex: handOffset + start,
            endIndex: handOffset + end,
            handIndex: handIndex
          });
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
