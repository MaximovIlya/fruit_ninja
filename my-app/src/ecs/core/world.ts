export class World {
    private _entities: Array<any> = [];

    get entities() {
        return this._entities;
    }

    set entities(entities: Array<any>) {
        this._entities = entities;
    }

    addEntity(entity: any) {
        this._entities.push(entity);
    }

    removeEntity(entityId: string) {
        this._entities = this._entities.filter(entity => entity.id !== entityId);
    }
}