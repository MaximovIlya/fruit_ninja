import type { FingerPositions } from "../components/fingerPosition";
import type { Entity } from "../core/types";

export class RenderSystem {
  static process(ctx: CanvasRenderingContext2D, entities: Entity[], fingerPositions?: FingerPositions) {
    // Clear with transparent background instead of solid color
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw fruits
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

    // Draw finger positions as green markers
    if (fingerPositions) {
      ctx.save();
      for (const finger of fingerPositions.landmarks) {
        if (finger.visibility > 0.5) {
          ctx.beginPath();
          ctx.arc(finger.x, finger.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = "#00ff00";
          ctx.fill();
          ctx.strokeStyle = "#00aa00";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }
}
