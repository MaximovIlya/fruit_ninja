import { useRef, useEffect } from "react";
import { Game } from "../ecs/Game";
import { HandTrackingSystem } from "../ecs/systems/HandTrackingSystem";

interface GameHookCallbacks {
    onScoreChange?: (score: number) => void;
    onLivesChange?: (lives: number) => void;
    onGameOver?: (finalScore: number) => void;
}

export const useGame = (
    handTrackingSystem: HandTrackingSystem | null,
    width: number,
    height: number,
    callbacks: GameHookCallbacks = {},
    soundCallbacks?: {
        playSliceSound: () => void;
        playBombSound: () => void;
    }
) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    
    // Используем useRef для стабильности колбэков
    const callbacksRef = useRef(callbacks);
    const soundCallbacksRef = useRef(soundCallbacks);

    // Обновляем рефы при изменении колбэков
    useEffect(() => {
        callbacksRef.current = callbacks;
    }, [callbacks]);

    useEffect(() => {
        soundCallbacksRef.current = soundCallbacks;
    }, [soundCallbacks]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || width === 0 || height === 0) return;

        const game = new Game(
            canvas, 
            handTrackingSystem,  
            callbacksRef.current,     
            soundCallbacksRef.current 
        );
        
        game.loadAssets().catch(console.error);
        gameRef.current = game;

        const animationFrameId = requestAnimationFrame(gameLoop);

        function gameLoop(timestamp: number) {
            game.update(timestamp);
            requestAnimationFrame(gameLoop);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            game.dispose();
        };

    }, [width, height, handTrackingSystem]); // Только стабильные зависимости

    return {
        canvasRef,
        gameRef,
    };
}