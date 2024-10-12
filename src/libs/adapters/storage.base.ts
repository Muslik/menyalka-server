import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Effect, Option, pipe } from 'effect';
import Redis from 'ioredis';

import { AggregateRoot, Mapper } from '../ddd';
import { StoragePort } from '../ddd/storage.port';
import { LoggerPort } from '../ports/logger.port';
import { ObjectLiteral } from '../types';

@Injectable()
export abstract class StorageBase<Aggregate extends AggregateRoot<any>, StorageModel extends ObjectLiteral>
  implements StoragePort<Aggregate> {
  private readonly redis: Redis;
  private readonly redisService: RedisService;

  protected constructor(
    protected readonly namespace: string,
    protected readonly mapper: Mapper<Aggregate, StorageModel>,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly logger: LoggerPort,
  ) {
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

  setMap(key: string, value: Aggregate, expirationInSeconds?: number): Effect.Effect<void, Error> {
    return pipe(
      Effect.tryPromise(() => this.redis.hset(key, this.mapper.toPersistence(value))),
      Effect.flatMap(() =>
        expirationInSeconds !== undefined && expirationInSeconds > 0
          ? this.expire(key, expirationInSeconds)
          : Effect.succeed(undefined),
      ),
      Effect.tap(() => value.publishEvents(this.logger, this.eventEmitter)),
    );
  }

  getMap(key: string): Effect.Effect<Option.Option<Aggregate>, Error> {
    return pipe(
      Effect.tryPromise(() => this.redis.hgetall(key)),
      Effect.map((keys) => (Object.keys(keys).length === 0 ? Option.none() : Option.some(this.mapper.toDomain(keys)))),
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
