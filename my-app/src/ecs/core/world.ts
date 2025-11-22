import type { Entity } from './types';

export class World {
    private _entities: Entity[] = [];

    get entities(): Entity[] {
        return this._entities;
    }

    set entities(entities: Entity[]) {
        this._entities = entities;
    }

    addEntity(entity: Entity): void {
        this._entities.push(entity);
    }

    removeEntity(entityId: string): void {
        this._entities = this._entities.filter(entity => entity.id !== entityId);
    }

    getEntitiesWithComponents(...componentNames: string[]): Entity[] {
        return this._entities.filter(entity => 
            componentNames.every(componentName => 
                entity.components[componentName] !== undefined
            )
        );
    }

    clear(): void {
        this._entities = [];
    }
}