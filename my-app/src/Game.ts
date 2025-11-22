import { World } from "./ecs/core/world";
import { FruitFactory } from "./entities/createFruit";
import { CollisionSystem } from "./systems/CollisionSystem";
import { DisposalSystem } from "./systems/disposalSystem";
import { MovementSystem } from "./systems/movementSystem";
import { RenderSystem } from "./systems/RenderSystem";
import type { MousePosition } from "./types";

export class Game {
    private _ctx: CanvasRenderingContext2D;
    private _canvasHeight: number;
    private _canvasWidth: number;
    private _world: World;
    private _fruitFactory: FruitFactory;
    private _disposalSystem: DisposalSystem;
    private _mousePos: MousePosition = null;

    constructor(private _canvas: HTMLCanvasElement) {
        this._ctx = this._canvas.getContext('2d')!;
        this._canvasWidth = this._canvas.width;
        this._canvasHeight = this._canvas.height;
        this._world = new World();
        this._fruitFactory = new FruitFactory(this._canvasWidth, this._canvasHeight);
        this._disposalSystem = new DisposalSystem(this._canvasHeight);
    }

    get disposalSystem() {
        return this._disposalSystem;
    }

    setMousePosition(mousePos: MousePosition) {
        this._mousePos = mousePos;
    }

    spawnFruit() {
        for (let i = 0; i < 1; i++) {
            const fruit = this._fruitFactory.createFruit();
            this._world.addEntity(fruit);
        }
    }

    update() {
        MovementSystem.process(this._world.entities);
        this._world.entities = this._disposalSystem.process(this._world.entities);

        if (this._mousePos) {
            CollisionSystem.process(this._world.entities, [this._mousePos]);
        }

        RenderSystem.process(this._ctx, this._world.entities);
    }

}