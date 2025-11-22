import { SPAWN_INTERVAL } from "../config";
import type { MousePosition } from "../types";
import { World } from "./core/World";
import { FruitFactory } from "./entities/createFruit";
import { CollisionSystem } from "./systems/CollisionSystem";
import { DisposalSystem } from "./systems/DisposalSystem";
import { MouseTrackSystem } from "./systems/MouseTrackSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { RenderSystem } from "./systems/RenderSystem";

export class Game {
    private _ctx: CanvasRenderingContext2D;
    private _canvasHeight: number;
    private _canvasWidth: number;
    private _world: World;
    private _fruitFactory: FruitFactory;
    private _disposalSystem: DisposalSystem;
    private _mouseTrackSystem: MouseTrackSystem;
    private _collisionSystem: CollisionSystem;
    private _lastSpawnTime: number = 0;
    private _spawnInterval: number = SPAWN_INTERVAL;

    constructor(private _canvas: HTMLCanvasElement) {
        this._ctx = this._canvas.getContext('2d')!;
        this._canvasWidth = this._canvas.width;
        this._canvasHeight = this._canvas.height;
        this._world = new World();
        this._fruitFactory = new FruitFactory(this._canvasWidth, this._canvasHeight);
        this._disposalSystem = new DisposalSystem(this._canvasHeight, this._world);
        this._mouseTrackSystem = new MouseTrackSystem()
        this._collisionSystem = new CollisionSystem(this._world, (entityId) => this.handleFruitCut(entityId));
    }

    set mousePosition(mousePos: MousePosition) {
        this._mouseTrackSystem.mousePosition = mousePos;
    }

    spawnFruit() {
        for (let i = 0; i < 1; i++) {
            const fruit = this._fruitFactory.createFruit();
            this._world.addEntity(fruit);
        }
    }

    update(timestamp: number = performance.now()) {
        if (timestamp - this._lastSpawnTime >= this._spawnInterval) {
            this.spawnFruit();
            this._lastSpawnTime = timestamp;
        }

        MovementSystem.process(this._world);
        this._disposalSystem.process();

        if (this._mouseTrackSystem.mousePosition) {
            this._collisionSystem.process([this._mouseTrackSystem.mousePosition]);
        }

        RenderSystem.process(this._ctx, this._world.entities);
    }

    private handleFruitCut(entityId: string): void {
        this._disposalSystem.disposeById(entityId);
    }

}