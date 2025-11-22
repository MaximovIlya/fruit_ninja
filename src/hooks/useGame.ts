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
    callbacks: GameHookCallbacks = {}
) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const { onScoreChange, onLivesChange, onGameOver } = callbacks;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || width === 0 || height === 0) return;

        const game = new Game(canvas, handTrackingSystem, {
            onScoreChange,
            onLivesChange,
            onGameOver
        });
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

    }, [width, height, handTrackingSystem, onScoreChange, onLivesChange, onGameOver]);

    return {
        canvasRef,
        gameRef,
    };
}