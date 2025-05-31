export type Component = Record<string, any>; //TODO: create type for component properties

export type Entity = {
  id: string;
  components: Record<string, Component>;
};

export type World = {
  entities: Entity[];
};