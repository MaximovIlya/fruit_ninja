import { Entity } from "./Entity";
import type { System } from "./type";

export class World {
  private systems: System[] = [];
  private entities: Entity[] = [];

  createEntity(): Entity {
    const entity = new Entity();
    this.entities.push(entity);
    return entity;
  }

  queryEntitiesWith(names: string[]): Entity[] {
    return this.entities.filter(e => e.hasComponents(names));
  }

  register(system: System): void {
    this.systems.push(system);
  }

  update(delta: number): void {
    for (const system of this.systems) {
      system.update(delta);
    }
  }
}