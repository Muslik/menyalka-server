import { Effect, Option } from 'effect';

export interface StorageService {
  set(key: string, value: string, expirationInSeconds?: number): Effect.Effect<void>;
  get(key: string): Effect.Effect<Option.Option<string>>;
  setMap(key: string, value: Record<string, string>, expirationInSeconds?: number): Effect.Effect<void>;
  getMap(key: string, field: string): Effect.Effect<Option.Option<Record<string, string>>>;
  getMapField(key: string, field: string): Effect.Effect<Option.Option<string>>;
  deleteKey(key: string, field: string): Effect.Effect<void>;
  expire(key: string, expirationInSeconds: number): Effect.Effect<void>;
  eval(
    ...args: [script: string | Buffer, numkeys: number | string, ...args: (string | Buffer | number)[]]
  ): Promise<unknown>;
}
