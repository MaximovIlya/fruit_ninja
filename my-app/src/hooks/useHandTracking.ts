import { useEffect, useRef, useState } from 'react';
import { Hands, type Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandResults {
  landmarks: HandLandmark[][];
  isDetected: boolean;
}

export const useHandTracking = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [handResults, setHandResults] = useState<HandResults>({
    landmarks: [],
    isDetected: false,
  });
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    if (!videoRef || !videoRef.current) return;

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: Results) => {
      if (results.multiHandLandmarks) {
        setHandResults({
          landmarks: results.multiHandLandmarks,
          isDetected: results.multiHandLandmarks.length > 0,
        });
      } else {
        setHandResults({
          landmarks: [],
          isDetected: false,
        });
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current! });
      },
      width: 640,
      height: 480,
    });

    handsRef.current = hands;
    cameraRef.current = camera;
    camera.start();

    return () => {
      camera.stop();
    };
  }, [videoRef]);

  return handResults;
};
