import type { FingerPositions } from "../components/fingerPosition";
import type { Entity } from "../core/types";

export class RenderSystem {
  static process(ctx: CanvasRenderingContext2D, entities: Entity[], videoElement: HTMLVideoElement | null, wallImage: HTMLImageElement | null, fruitImages: Map<string, HTMLImageElement>, fingerPositions?: FingerPositions, fps?: number) {
    // Clear with transparent background instead of solid color
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (videoElement) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-ctx.canvas.width, 0);
        ctx.globalAlpha = 1;
        ctx.drawImage(videoElement, 0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }

    if (wallImage) {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.drawImage(wallImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }

    // Draw FPS
    if (fps) {
        ctx.save();
        ctx.font = "24px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(`FPS: ${fps}`, 10, 30);
        ctx.restore();
    }

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
      const fruitImage = fruitImages.get(type.value);
      const diameter = size.radius * 2;

      if (fruitImage) {
        // Draw fruit image
        ctx.drawImage(
          fruitImage,
          pos.x - size.radius,
          pos.y - size.radius,
          diameter,
          diameter
        );
      } else {
        // Fallback to colored circle if image not loaded
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
      }

      ctx.restore();
    }

    // Draw finger positions as green markers and lines
    if (fingerPositions) {
      ctx.save();
      // Draw landmarks
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

      // Draw edges (skeleton)
      ctx.beginPath();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      for (const edge of fingerPositions.edges) {
        const start = fingerPositions.landmarks[edge.startIndex];
        const end = fingerPositions.landmarks[edge.endIndex];
        if (start && end && start.visibility > 0.5 && end.visibility > 0.5) {
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
        }
      }
      ctx.stroke();

      ctx.restore();
    }
  }
}
