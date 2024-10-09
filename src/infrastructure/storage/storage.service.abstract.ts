import { Effect, Option } from 'effect';

export abstract class StorageService {
  abstract set(key: string, value: string, expirationInSeconds?: number): Effect.Effect<void, Error>;
  abstract get(key: string): Effect.Effect<Option.Option<string>, Error>;
  abstract setMap(key: string, value: Record<string, string>, expirationInSeconds?: number): Effect.Effect<void, Error>;
  abstract getMap(key: string): Effect.Effect<Option.Option<Record<string, string>>, Error>;
  abstract getMapField(key: string, field: string): Effect.Effect<Option.Option<string>, Error>;
  abstract delete(key: string): Effect.Effect<void, Error>;
  abstract expire(key: string, expirationInSeconds: number): Effect.Effect<void, Error>;
}
