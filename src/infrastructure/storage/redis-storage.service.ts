import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { Effect, Option, pipe } from 'effect';
import Redis from 'ioredis';

import { StorageService } from './storage.service.abstract';

@Injectable()
export class RedisStorageService extends StorageService {
  private readonly redis: Redis;

  constructor(
    private readonly redisService: RedisService,
    namespace: string,
  ) {
    super();
    this.redis = this.redisService.getOrThrow(namespace);
  }

  set(key: string, value: string, expirationInSeconds?: number): Effect.Effect<void, Error> {
    return Effect.tryPromise(() =>
      expirationInSeconds !== undefined && expirationInSeconds > 0
        ? this.redis.set(key, value, 'EX', expirationInSeconds)
        : this.redis.set(key, value),
    );
  }

  get(key: string): Effect.Effect<Option.Option<string>, Error> {
    return pipe(
      Effect.tryPromise(() => this.redis.get(key)),
      Effect.map(Option.fromNullable),
    );
  }

  setMap(key: string, value: Record<string, string>, expirationInSeconds?: number): Effect.Effect<void, Error> {
    return pipe(
      Effect.tryPromise(() => this.redis.hset(key, value)),
      Effect.flatMap(() =>
        expirationInSeconds !== undefined && expirationInSeconds > 0
          ? this.expire(key, expirationInSeconds)
          : Effect.succeed(undefined),
      ),
    );
  }

  getMap(key: string): Effect.Effect<Option.Option<Record<string, string>>, Error> {
    return pipe(
      Effect.tryPromise(() => this.redis.hgetall(key)),
      Effect.map((keys) => (Object.keys(keys).length === 0 ? Option.none() : Option.some(keys))),
    );
  }

  getMapField(key: string, field: string): Effect.Effect<Option.Option<string>, Error> {
    return pipe(
      Effect.tryPromise(() => this.redis.hget(key, field)),
      Effect.map(Option.fromNullable),
    );
  }

  delete(key: string): Effect.Effect<void, Error> {
    return Effect.tryPromise(() => this.redis.del(key));
  }

  expire(key: string, expirationInSeconds: number): Effect.Effect<void, Error> {
    return Effect.tryPromise(() => this.redis.expire(key, expirationInSeconds));
  }
}
