import type { World } from "../core/types";

type Point = { x: number; y: number };

export class CollisionSystem {
  constructor(
    private _world: World,
    private _onFruitCut?: (entityId: string) => void
  ) {}
  
  process(points: Point[]): void {
    for (const entity of this._world.entities) {
      const pos = entity.components.position!;
      const size = entity.components.size!;
      const isCut = entity.components.isCut!;

      if (isCut.isCut) continue;

      for (const point of points) {
        const dx = point.x - pos.x;
        const dy = point.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < size.radius) {
          isCut.isCut = true;
          console.log(`Fruit ${entity.id} cut at (${point.x}, ${point.y})`);
          
          if (this._onFruitCut) {
            this._onFruitCut(entity.id);
          }
          
          break;
        }
      }
    }
  }
}