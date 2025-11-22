import { useEffect, useRef } from "react";
import { Game } from "../ecs/Game";

export const useCanvasAnimation = () => {
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

        const gameLoop = () => {
        game.update();
        animationRef.current = requestAnimationFrame(gameLoop);
        };

        animationRef.current = requestAnimationFrame(gameLoop);

        return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        };
    }, []);

    return {
        canvasRef,
    };
}