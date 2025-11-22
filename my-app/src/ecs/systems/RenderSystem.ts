import type { Entity } from "../types";

const FRUIT_COLORS: Record<string, string> = {
  apple: '#ff4444',
  orange: '#ff8844',
  banana: '#ffff44',
  watermelon: '#44ff44',
};

export class RenderSystem {
  static process(ctx: CanvasRenderingContext2D, entities: Entity[]) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (const entity of entities) {
      const pos = entity.components.position;
      const size = entity.components.size;
      const type = entity.components.type;

      if (pos && size && type) {
        ctx.fillStyle = FRUIT_COLORS[type.value] || '#888';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
