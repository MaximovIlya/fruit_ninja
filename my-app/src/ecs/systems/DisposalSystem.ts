import type { World } from "../core/types";

export class DisposalSystem {
  constructor(
    private _canvasHeight: number,
    private _world: World
  ) {}

  process(): void {
    const validEntities = this._world.entities.filter(entity => {
      const pos = entity.components.position;
      if (!pos) return true;
      return pos.y <= this._canvasHeight + 100;
    });
    
    this._world.entities = validEntities;
  }

  disposeById(id: string): void {
    this._world.entities = this._world.entities.filter(entity => entity.id !== id);
  }
}
