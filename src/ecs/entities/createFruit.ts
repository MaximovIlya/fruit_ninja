import type { Entity } from "../core/types";

const FRUIT_TYPES = ['apple', 'orange', 'banana', 'watermelon'] as const;

export class FruitFactory {
  constructor(
    private _canvasWidth: number,
    private _canvasHeight: number
  ) {
  }

  createFruit(): Entity {
    const horizontalMargin = this._canvasWidth * 0.15;
    const spawnWidth = this._canvasWidth - horizontalMargin * 2;
    const launchX = horizontalMargin + Math.random() * spawnWidth;

    const launchSpeedY = -(14 + Math.random() * 8);
    const launchSpeedX = (Math.random() - 0.5) * 6;
    
    const fruitType = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
    
    // Разная гравитация для разных фруктов
    const gravityForces: Record<string, number> = {
      'apple': 0.5,
      'orange': 0.45,
      'banana': 0.4,
      'watermelon': 0.6 // арбуз тяжелее - быстрее падает
    };

    return {
      id: Math.random().toString(36).substr(2, 9),
      components: {
        position: {
          x: launchX,
          y: this._canvasHeight + 60,
        },
        velocity: {
          vx: launchSpeedX,
          vy: launchSpeedY,
        },
        gravity: {
          force: gravityForces[fruitType] || 0.5,
        },
        size: {
          radius: 30 + Math.random() * 20,
        },
        isCut: {
          isCut: false,
        },
        type: {
          value: fruitType,
        },
      },
    };
  }
}
