import { useRef, useCallback } from 'react';
import { HandTrackingSystem } from '../ecs/systems/HandTrackingSystem';
import { PinchClickStrategy } from '../ecs/systems/gestures/PinchClickStrategy';

export const useHandTracking = (width: number, height: number) => {
    const handTrackingSystemRef = useRef<HandTrackingSystem | null>(null);

    const initializeHandTracking = useCallback(async (videoElement: HTMLVideoElement) => {
        if (handTrackingSystemRef.current) {
            handTrackingSystemRef.current.dispose();
        }

        const strategies = [new PinchClickStrategy()];
        const handTrackingSystem = new HandTrackingSystem(width, height, strategies);
        await handTrackingSystem.initializeCamera(videoElement);
        handTrackingSystemRef.current = handTrackingSystem;

        return handTrackingSystem;
    }, [width, height]);

    const disposeHandTracking = useCallback(() => {
        if (handTrackingSystemRef.current) {
            handTrackingSystemRef.current.dispose();
            handTrackingSystemRef.current = null;
        }
    }, []);

    return { initializeHandTracking, disposeHandTracking };
}; 