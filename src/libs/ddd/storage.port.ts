import { Effect, Option } from "effect";

export interface StoragePort<Entity> {
  set(key: string, value: string, expirationInSeconds?: number): Effect.Effect<void, Error>;
  get(key: string): Effect.Effect<Option.Option<string>, Error>;
  setMap(key: string, value: Entity, expirationInSeconds?: number): Effect.Effect<void, Error>;
  getMap(key: string): Effect.Effect<Option.Option<Entity>, Error>;
  getMapField(key: string, field: string): Effect.Effect<Option.Option<string>, Error>;
  delete(key: string): Effect.Effect<void, Error>;
  expire(key: string, expirationInSeconds: number): Effect.Effect<void, Error>;
}
