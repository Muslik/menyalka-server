import { Inject, Injectable } from '@nestjs/common';
import { Effect, Option } from 'effect';

import { StorageService, STORAGE_SERVICE } from '../storage';

@Injectable()
export class CacheStorageService {
  constructor(@Inject(STORAGE_SERVICE) private readonly storageService: StorageService) {}

  cacheData(key: string, value: Record<string, string>, ttl: number): Effect.Effect<void, Error> {
    return this.storageService.setMap(key, value, ttl);
  }

  getCachedData(key: string): Effect.Effect<Option.Option<Record<string, string>>, Error> {
    return this.storageService.getMap(key, 'cache');
  }

  deleteCache(key: string): Effect.Effect<void, Error> {
    return this.storageService.deleteKey(key, 'cache');
  }
}
