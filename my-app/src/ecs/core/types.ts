
export type ComponentMap = {
  [componentName: string]: any; // TODO: Define specific types for components
};

export type Entity = {
  id: string;
  components: ComponentMap;
};

export type World = {
  entities: Entity[];
};