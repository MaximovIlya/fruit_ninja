import { SPAWN_INTERVAL } from "../config";
import type { MousePosition } from "../types";
import { World } from "./core/World";
import { FruitFactory } from "./entities/createFruit";
import { CollisionSystem } from "./systems/CollisionSystem";
import { DisposalSystem } from "./systems/DisposalSystem";
import { MouseTrackSystem } from "./systems/MouseTrackSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { RenderSystem } from "./systems/RenderSystem";
import { HandTrackingSystem } from "./systems/HandTrackingSystem";
import { PinchClickStrategy } from './systems/gestures/PinchClickStrategy';
import { wall } from "../assets";


export class Game {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _canvasHeight: number;
    private _canvasWidth: number;
    private _world: World;
    private _fruitFactory: FruitFactory;
    private _disposalSystem: DisposalSystem;
    private _mouseTrackSystem: MouseTrackSystem;
    private _handTrackingSystem: HandTrackingSystem;
    private _collisionSystem: CollisionSystem;
    private _lastSpawnTime: number = 0;
    private _spawnInterval: number = SPAWN_INTERVAL;
    private _frameCount: number = 0;
    private _lastFPSTime: number = 0;
    private _fps: number = 0;
    private _wallImage: HTMLImageElement | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        this._ctx = this._canvas.getContext('2d')!;
        this._canvasWidth = canvas.width;
        this._canvasHeight = canvas.height;
        this._world = new World();
        this._fruitFactory = new FruitFactory(this._canvasWidth, this._canvasHeight);
        this._disposalSystem = new DisposalSystem(this._canvasHeight, this._world);
        this._mouseTrackSystem = new MouseTrackSystem()
        this._handTrackingSystem = new HandTrackingSystem(this._canvasWidth, this._canvasHeight, [new PinchClickStrategy()]);
        this._collisionSystem = new CollisionSystem(this._world, (entityId) => this.handleFruitCut(entityId));
    }

    set mousePosition(mousePos: MousePosition) {
        this._mouseTrackSystem.mousePosition = mousePos;
    }

    async initializeHandTracking(videoElement: HTMLVideoElement): Promise<void> {
        await this._handTrackingSystem.initializeCamera(videoElement);
    }

    async loadAssets(): Promise<void> {
        this._wallImage = new Image();
        this._wallImage.src = wall;
        await this._wallImage.decode();
    }

    spawnFruit() {
        for (let i = 0; i < 1; i++) {
            const fruit = this._fruitFactory.createFruit();
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
        
        if (timestamp - this._lastSpawnTime >= this._spawnInterval) {
            this.spawnFruit();
            this._lastSpawnTime = timestamp;
        }

        MovementSystem.process(this._world);
        this._disposalSystem.process();

        const mousePoints = this._mouseTrackSystem.mousePosition ? [this._mouseTrackSystem.mousePosition] : [];
        const fingerPositions = this._handTrackingSystem.fingerPositions;
        
        this._collisionSystem.process(mousePoints, fingerPositions);

        RenderSystem.process(this._ctx, this._world.entities, this._handTrackingSystem.videoElement, this._wallImage, fingerPositions, this._fps);
    }

    private handleFruitCut(entityId: string): void {
        this._disposalSystem.disposeById(entityId);
    }

    dispose(): void {
        this._handTrackingSystem.dispose();
    }
}