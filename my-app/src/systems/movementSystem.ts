import type { Entity } from "../types";

export class MovementSystem {
  static gravityFactor = 0.11;
  
  static process(entities: Entity[]) {
    for (const entity of entities) {
      const pos = entity.components.position;
      const vel = entity.components.velocity;

      if (pos && vel) {
        pos.x += vel.vx;
        pos.y += vel.vy;
        vel.vy += MovementSystem.gravityFactor;
      }
    }
  }
}
