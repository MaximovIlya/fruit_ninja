import { useEffect, useRef } from "react";
import { Game } from "../ecs/Game";

export const useCanvasAnimation = (videoElement: HTMLVideoElement | null) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const gameRef = useRef<Game | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const newMousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        if (gameRef.current) {
            gameRef.current.mousePosition = newMousePos;
        }
        };

        canvas.addEventListener('mousemove', handleMouseMove);

        const game = new Game(canvas);
        game.spawnFruit();
        gameRef.current = game;

        // Initialize hand tracking when video element is available
        if (videoElement) {
            game.initializeHandTracking(videoElement).catch(console.error);
        }

        const gameLoop = (timestamp: number) => {
            game.update(timestamp);
            animationRef.current = requestAnimationFrame(gameLoop);
        };

        animationRef.current = requestAnimationFrame(gameLoop);

        return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        if (gameRef.current) {
            gameRef.current.dispose();
        }
        };
    }, [videoElement]);

    return {
        canvasRef,
    };
}