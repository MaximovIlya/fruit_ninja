import { useRef, useEffect } from "react";
import { Game } from "../ecs/Game";
import { HandTrackingSystem } from "../ecs/systems/HandTrackingSystem";

export const useGame = (
    handTrackingSystem: HandTrackingSystem | null,
    width: number,
    height: number,
    onScoreChange?: (score: number) => void
) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || width === 0 || height === 0) return;

        const game = new Game(canvas, handTrackingSystem, onScoreChange);
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

    }, [width, height, handTrackingSystem, onScoreChange]);

    return {
        canvasRef,
        gameRef,
    };
}