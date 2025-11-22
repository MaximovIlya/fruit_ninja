import type { Entity } from "../ecs/core/types";

type Point = { x: number; y: number };

export class CollisionSystem {
  static process(entities: Entity[], points: Point[]) {
    for (const entity of entities) {
      const pos = entity.components.position;
      const size = entity.components.size;
      const isCut = entity.components.isCut;

      if (!pos || !size || !isCut || isCut.isCut) continue;

      for (const point of points) {
        const dx = point.x - pos.x;
        const dy = point.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < size.radius) {
          isCut.isCut = true;
          console.log(`Fruit ${entity.id} cut at (${point.x}, ${point.y})`);
          break;
        }
      }
    }
  }
}