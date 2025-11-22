import type { Entity } from "../core/types";

const FRUIT_TYPES = ['apple', 'orange', 'banana', 'watermelon', 'purple_bomb'] as const;

type FruitType = typeof FRUIT_TYPES[number];

interface CreateFruitOptions {
  forceType?: FruitType;
  speedMultiplier?: number;
}

export class FruitFactory {
  constructor(
    private _canvasWidth: number,
    private _canvasHeight: number
  ) {
  }

  createFruit(options: CreateFruitOptions = {}): Entity {
    const horizontalMargin = this._canvasWidth * 0.15;
    const spawnWidth = this._canvasWidth - horizontalMargin * 2;
    const launchX = horizontalMargin + Math.random() * spawnWidth;

    const speedMultiplier = options.speedMultiplier ?? 1;
    const launchSpeedY = -(14 + Math.random() * 8) * speedMultiplier;
    const launchSpeedX = (Math.random() - 0.5) * 6 * speedMultiplier;
    
    const fruitType: FruitType = options.forceType ?? FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
    
    // Разная гравитация для разных фруктов
    const gravityForces: Record<string, number> = {
      'apple': 0.45,
      'orange': 0.4,
      'banana': 0.35,
      'watermelon': 0.5, // арбуз тяжелее - быстрее падает
      'purple_bomb': 0.4
    };

    // Размеры фруктов: арбуз самый большой, банан самый маленький
    const fruitSizes: Record<string, { min: number; max: number }> = {
      'watermelon': { min: 55, max: 60 }, // самый большой
      'apple': { min: 40, max: 45 },      // средний
      'orange': { min: 35, max: 42 },     // средний-маленький
      'banana': { min: 30, max: 36 },
      'purple_bomb': {min: 40, max: 45}
    };

    const sizeRange = fruitSizes[fruitType] || { min: 30, max: 35 };
    const radius = sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min);

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
          radius: radius,
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
