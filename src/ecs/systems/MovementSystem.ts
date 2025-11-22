import { GRAVITY_FACTOR } from "../../config";
import type { World } from "../core/World";

export class MovementSystem {
  static gravityFactor = GRAVITY_FACTOR;
  
  static process(world: World): void {
    const entities = world.getEntitiesWithComponents('position', 'velocity');
    
    for (const entity of entities) {
      const pos = entity.components.position!;
      const vel = entity.components.velocity!;

      pos.x += vel.vx;
      pos.y += vel.vy;
      vel.vy += MovementSystem.gravityFactor;
    }
  }
}
