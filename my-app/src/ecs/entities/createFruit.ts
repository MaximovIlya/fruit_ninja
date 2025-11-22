import type { Entity } from "../core/types";

export class FruitFactory {
  constructor(
    private _canvasWidth: number,
    private _canvasHeight: number
  ) {
  }

  createFruit(): Entity {
    return {
      id: Math.random().toString(36).substr(2, 9),
      components: {
        position: {
          x: Math.random() * this._canvasWidth,
          y: this._canvasHeight + 50,
        },
        velocity: {
          vx: (Math.random() - 0.5) * 10,
          vy: -Math.random() * 4 - 10,
        },
        size: {
          radius: 30 + Math.random() * 20,
        },
        isCut: {
          isCut: false,
        },
        type: {
          value: ['apple', 'orange', 'banana', 'watermelon'][
            Math.floor(Math.random() * 4)
          ],
        },
      },
    };
  }
}
