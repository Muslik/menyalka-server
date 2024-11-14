import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { Effect, Option, pipe } from 'effect';
import Redis from 'ioredis';

import { StorageService } from './storage.service.interface';

@Injectable()
export class RedisStorageService implements StorageService {
  private readonly instance: Redis;

  constructor(
    private readonly redisService: RedisService,
    namespace: string,
  ) {
    this.instance = this.redisService.getOrThrow(namespace);
  }

  eval(
    ...args: [script: string | Buffer, numkeys: number | string, ...args: (string | Buffer | number)[]]
  ): Promise<unknown> {
    return this.instance.eval(...args);
  }

  set(key: string, value: string, expirationInSeconds?: number): Effect.Effect<void> {
    return Effect.promise(() =>
      expirationInSeconds !== undefined && expirationInSeconds > 0
        ? this.instance.set(key, value, 'EX', expirationInSeconds)
        : this.instance.set(key, value),
    );
  }

  get(key: string): Effect.Effect<Option.Option<string>> {
    return pipe(
      Effect.promise(() => this.instance.get(key)),
      Effect.map(Option.fromNullable),
    );
  }

  setMap(key: string, value: Record<string, string>, expirationInSeconds?: number): Effect.Effect<void> {
    return pipe(
      Effect.promise(() => this.instance.hset(key, value)),
      Effect.flatMap(() =>
        expirationInSeconds !== undefined && expirationInSeconds > 0
          ? this.expire(key, expirationInSeconds)
          : Effect.succeed(undefined),
      ),
    );
  }

  getMap(key: string, field: string): Effect.Effect<Option.Option<Record<string, string>>> {
    return pipe(
      Effect.promise(() => this.instance.hget(key, field)),
      Effect.map((item) => (item ? Option.some(JSON.parse(item)) : Option.none())),
    );
  }

  getMapField(key: string, field: string): Effect.Effect<Option.Option<string>> {
    return pipe(
      Effect.promise(() => this.instance.hget(key, field)),
      Effect.map(Option.fromNullable),
    );
  }

  deleteKey(key: string, field: string): Effect.Effect<void> {
    return Effect.promise(() => this.instance.hdel(key, field));
  }

  expire(key: string, expirationInSeconds: number): Effect.Effect<void> {
    return Effect.promise(() => this.instance.expire(key, expirationInSeconds));
  }
}
