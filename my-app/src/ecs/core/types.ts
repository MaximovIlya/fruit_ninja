import type { Position } from '../components/position';
import type { Size } from '../components/size';
import type { IsCut } from '../components/isCut';
import type { FingerPositions } from '../components/fingerPosition';

export type Velocity = {
  vx: number;
  vy: number;
};

export type FruitType = {
  value: 'apple' | 'orange' | 'banana' | 'watermelon';
};

export type ComponentMap = {
  position?: Position;
  velocity?: Velocity;
  size?: Size;
  isCut?: IsCut;
  type?: FruitType;
  fingerPositions?: FingerPositions;
};

export type Entity = {
  id: string;
  components: ComponentMap;
};

export interface System {
  process(...args: any[]): void;
}