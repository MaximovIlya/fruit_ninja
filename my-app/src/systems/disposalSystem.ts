import type { Entity } from "../types";

export class DisposalSystem {
  private canvasHeight: number;

  constructor(canvasHeight: number) {
    this.canvasHeight = canvasHeight;
  }

  process(entities: Entity[]): Entity[] {
    return entities.filter(entity => {
      const pos = entity.components.position;
      if (!pos) return true;
      return pos.y <= this.canvasHeight + 100;
    });
  }
}
