
import type { FingerPositions } from "../components/fingerPosition";
import type { World } from "../core/World";

type Point = { x: number; y: number };

export class CollisionSystem {
  constructor(
    private _world: World,
    private _onFruitCut?: (entityId: string) => void
  ) {}
  
  process(points: Point[], fingerPositions?: FingerPositions): void {
    // Combine mouse points with finger positions
    const allPoints = [...points];
    
    if (fingerPositions) {
      const visibleFingers = fingerPositions.landmarks.filter(finger => finger.visibility > 0.5);
      allPoints.push(...visibleFingers);
    }

    for (const entity of this._world.entities) {
      const pos = entity.components.position!;
      const size = entity.components.size!;
      const isCut = entity.components.isCut!;

      if (isCut.isCut) continue;

      for (const point of allPoints) {
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