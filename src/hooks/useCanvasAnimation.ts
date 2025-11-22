import { useEffect, useRef } from "react";
import { Game } from "../ecs/Game";

export const useCanvasAnimation = (
    videoRef: React.RefObject<HTMLVideoElement | null>,
    width: number,
    height: number
) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const gameRef = useRef<Game | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || width === 0 || height === 0) return;

        // Dispose of the old game instance if it exists
        if (gameRef.current) {
            gameRef.current.dispose();
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

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
        const videoElement = videoRef.current;
        if (videoElement) {
            game.loadAssets().then(() => {
                game.initializeHandTracking(videoElement).catch(console.error);
            }).catch(console.error);
        }

        const gameLoop = (timestamp: number) => {
            if (!gameRef.current) return;
            gameRef.current.update(timestamp);
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
                gameRef.current = null;
            }
        };
    }, [width, height, videoRef]);

    return {
        canvasRef,
    };
}