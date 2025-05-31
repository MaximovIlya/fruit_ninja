import { World } from "./World";

export interface System {
  world: World;
  update(delta: number): void;
}