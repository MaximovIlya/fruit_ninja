type ComponentMap = Map<string, any>; // TODO - define all possible components

export class Entity {
  components: ComponentMap = new Map();

  addComponent<T>(name: string, data: T): this {
    this.components.set(name, data);
    return this;
  }

  getComponent<T>(name: string): T {
    return this.components.get(name);
  }

  hasComponents(names: string[]): boolean {
    return names.every(name => this.components.has(name));
  }
}
