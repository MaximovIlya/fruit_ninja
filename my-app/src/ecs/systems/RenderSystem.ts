import type { Entity } from "../types";

export class RenderSystem {
  static process(ctx: CanvasRenderingContext2D, entities: Entity[]) {
    // Clear with transparent background instead of solid color
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (const entity of entities) {
      const pos = entity.components.position;
      const size = entity.components.size;
      const type = entity.components.type;
      const isCut = entity.components.isCut;

      if (!pos || !size || !type) continue;

      ctx.save();

      // Apply transparency if fruit is cut
      if (isCut?.isCut) {
        ctx.globalAlpha = 0.5;
      }

      // Draw fruit based on type
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size.radius, 0, Math.PI * 2);

      switch (type.value) {
        case "apple":
          ctx.fillStyle = "#ff4757";
          break;
        case "orange":
          ctx.fillStyle = "#ff7f0e";
          break;
        case "banana":
          ctx.fillStyle = "#ffa502";
          break;
        case "watermelon":
          ctx.fillStyle = "#2ed573";
          break;
        default:
          ctx.fillStyle = "#747d8c";
      }

      ctx.fill();
      ctx.strokeStyle = "#2f3542";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    }
  }
}
