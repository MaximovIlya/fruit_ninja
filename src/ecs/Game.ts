import { INITIAL_LIVES } from "../config";
import type { MousePosition } from "../types";
import { World } from "./core/World";
import { FruitFactory } from "./entities/createFruit";
import { CollisionSystem } from "./systems/CollisionSystem";
import { DisposalSystem } from "./systems/DisposalSystem";
import { MouseTrackSystem } from "./systems/MouseTrackSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { RenderSystem } from "./systems/RenderSystem";
import { HandTrackingSystem } from "./systems/HandTrackingSystem";
import { DifficultySystem } from "./systems/DifficultySystem";
import { wall, apple, orange, banana, watermelon, purple_bomb } from "../assets";

const SAFE_FRUIT_TYPES = ['apple', 'orange', 'banana', 'watermelon'] as const;

interface GameCallbacks {
    onScoreChange?: (score: number) => void;
    onLivesChange?: (lives: number) => void;
    onGameOver?: (finalScore: number) => void;
}

export class Game {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _canvasHeight: number;
    private _canvasWidth: number;
    private _world: World;
    private _fruitFactory: FruitFactory;
    private _disposalSystem: DisposalSystem;
    private _mouseTrackSystem: MouseTrackSystem;
    private _handTrackingSystem: HandTrackingSystem | null;
    private _collisionSystem: CollisionSystem;
    private _lastSpawnTime: number = 0;
    private _frameCount: number = 0;
    private _lastFPSTime: number = 0;
    private _fps: number = 0;
    private _wallImage: HTMLImageElement | null = null;
    private _fruitImages: Map<string, HTMLImageElement> = new Map();
    private _isPlaying = false;
    private _score: number = 0;
    private _lives: number = INITIAL_LIVES;
    private _onScoreChange?: (score: number) => void;
    private _onLivesChange?: (lives: number) => void;
    private _onGameOver?: (finalScore: number) => void;
    private _difficultySystem: DifficultySystem;
    private _playSliceSound?: () => void;
    private _playBombSound?: () => void;

    constructor(
        canvas: HTMLCanvasElement,
        handTrackingSystem: HandTrackingSystem | null = null,
        callbacks: GameCallbacks = {},
        soundCallBacks?: {
            playSliceSound: () => void;
            playBombSound: () => void;
        }
    ) {
        this._canvas = canvas;
        this._ctx = this._canvas.getContext('2d')!;
        this._canvasWidth = canvas.width;
        this._canvasHeight = canvas.height;
        this._world = new World();
        this._fruitFactory = new FruitFactory(this._canvasWidth, this._canvasHeight);
        this._disposalSystem = new DisposalSystem(this._canvasHeight, this._world);
        this._mouseTrackSystem = new MouseTrackSystem()
        this._handTrackingSystem = handTrackingSystem;
        this._collisionSystem = new CollisionSystem(this._world, (entityId) => this.handleFruitCut(entityId));
        this._onScoreChange = callbacks.onScoreChange;
        this._onLivesChange = callbacks.onLivesChange;
        this._onGameOver = callbacks.onGameOver;
        this._difficultySystem = new DifficultySystem();

        if (soundCallBacks) {
            this._playSliceSound = soundCallBacks.playSliceSound;
            this._playBombSound = soundCallBacks.playBombSound;
        }
    }

    startGame(): void {
        this._world.clear();
        this.resetScore();
        this.resetLives();
        this._isPlaying = true;
        const now = performance.now();
        this._lastSpawnTime = now;
        this._difficultySystem.reset(now);
    }

    set mousePosition(mousePos: MousePosition) {
        this._mouseTrackSystem.mousePosition = mousePos;
    }

    async initializeHandTracking(videoElement: HTMLVideoElement): Promise<void> {
        if (this._handTrackingSystem) {
            await this._handTrackingSystem.initializeCamera(videoElement);
        }
    }

    resetScore(): void {
        this._score = 0;
        if (this._onScoreChange) {
            this._onScoreChange(this._score);
        }
    }

    get score(): number {
        return this._score;
    }

    get lives(): number {
        return this._lives;
    }

    resetLives(): void {
        this._lives = INITIAL_LIVES;
        if (this._onLivesChange) {
            this._onLivesChange(this._lives);
        }
    }

    async loadAssets(): Promise<void> {
        // Load wall image
        this._wallImage = new Image();
        this._wallImage.src = wall;
        await this._wallImage.decode();

        // Load fruit images
        const fruitAssets = [
            { name: 'apple', src: apple },
            { name: 'orange', src: orange },
            { name: 'banana', src: banana },
            { name: 'watermelon', src: watermelon },
            { name: 'purple_bomb', src: purple_bomb }, // Используем purple_bomd.png, но сохраняем как purple_bomb
        ];

        const loadPromises = fruitAssets.map(({ name, src }) => {
            return new Promise<void>((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this._fruitImages.set(name, img);
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Failed to load image for ${name}, using fallback`);
                    resolve(); // Continue even if image fails
                };
                img.src = src;
            });
        });

        await Promise.all(loadPromises);
    }

    spawnFruit() {
        const fruitsToSpawn = Math.max(1, this._difficultySystem.fruitsPerSpawn);
        for (let i = 0; i < fruitsToSpawn; i++) {
            const fruitType = this.pickFruitType();
            const fruit = this._fruitFactory.createFruit({
                forceType: fruitType,
                speedMultiplier: this._difficultySystem.speedMultiplier
            });
            this._world.addEntity(fruit);
        }
    }

    update(timestamp: number = performance.now()) {
        if (this._lastFPSTime === 0) {
            this._lastFPSTime = timestamp;
        }

        this._frameCount++;
        if (timestamp - this._lastFPSTime >= 1000) {
            this._fps = this._frameCount;
            this._frameCount = 0;
            this._lastFPSTime = timestamp;
        }

        if (this._isPlaying) {
            this._difficultySystem.update(timestamp);
            if (timestamp - this._lastSpawnTime >= this._difficultySystem.spawnInterval) {
                this.spawnFruit();
                this._lastSpawnTime = timestamp;
            }

            MovementSystem.process(this._world);
            this._disposalSystem.process();

            const mousePoints = this._mouseTrackSystem.mousePosition ? [this._mouseTrackSystem.mousePosition] : [];
            const fingerPositions = this._handTrackingSystem ? this._handTrackingSystem.fingerPositions : { landmarks: [], edges: [] };

            this._collisionSystem.process(mousePoints, fingerPositions);

            RenderSystem.process(this._ctx, this._world.entities, this._handTrackingSystem?.videoElement ?? null, this._wallImage, this._fruitImages, fingerPositions, this._fps);
        } else {
            const fingerPositions = this._handTrackingSystem ? this._handTrackingSystem.fingerPositions : { landmarks: [], edges: [] };
            RenderSystem.process(this._ctx, this._world.entities, this._handTrackingSystem?.videoElement ?? null, this._wallImage, this._fruitImages, fingerPositions, this._fps);
        }
    }

    // В классе Game, метод handleFruitCut
    private handleFruitCut(entityId: string): void {
        const entity = this._world.entities.find(e => e.id === entityId);
        if (!entity) {
            return;
        }

        const fruitType = entity.components.type?.value;
        console.log('Fruit cut:', fruitType); // ДЛЯ ОТЛАДКИ

        this._disposalSystem.disposeById(entityId);

        if (fruitType === 'purple_bomb') {
            this.handleBombHit();
            
            if (this._playBombSound) {
                console.log('Playing bomb sound');
                this._playBombSound();
            } else {
                console.log('No bomb sound callback available');
            }
            return;
        }

        // Очки за разные фрукты: чем больше фрукт, тем больше очков
        const fruitPoints: Record<string, number> = {
            'watermelon': 10,
            'apple': 5,
            'orange': 3,
            'banana': 2,
        };

        const points = fruitPoints[fruitType || ''] || 1;
        this._score = Math.max(0, this._score + points);

        // ОТЛАДКА: проверяем, доступен ли звуковой колбэк
        console.log('Sound callback available:', !!this._playSliceSound);

        if (this._playSliceSound) {
            console.log('Playing slice sound'); // ДЛЯ ОТЛАДКИ
            this._playSliceSound();
        } else {
            console.log('No sound callback'); // ДЛЯ ОТЛАДКИ
        }

        if (this._onScoreChange) {
            this._onScoreChange(this._score);
        }
    }

    private handleBombHit(): void {
        this.loseLife(1);
    }

    private endGame(): void {
        if (!this._isPlaying) {
            return;
        }

        this._isPlaying = false;
        if (this._onGameOver) {
            this._onGameOver(this._score);
        }
    }

    private pickFruitType(): string {
        const shouldSpawnBomb = Math.random() < this._difficultySystem.bombChance;
        if (shouldSpawnBomb) {
            return 'purple_bomb';
        }

        const index = Math.floor(Math.random() * SAFE_FRUIT_TYPES.length);
        return SAFE_FRUIT_TYPES[index];
    }

    private loseLife(amount: number = 1): void {
        if (!this._isPlaying || amount <= 0) {
            return;
        }

        this._lives = Math.max(0, this._lives - amount);

        if (this._onLivesChange) {
            this._onLivesChange(this._lives);
        }

        if (this._lives <= 0) {
            this.endGame();
        }
    }

    dispose(): void {
        if (this._handTrackingSystem) {
            this._handTrackingSystem.dispose();
        }
    }
}