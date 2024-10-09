import { Inject, Injectable } from '@nestjs/common';

import { StorageService } from '../storage/storage.service.abstract';
import { STORAGE_SERVICE } from '../storage/storage.service.constants';
import { Effect, Option } from 'effect';

@Injectable()
export class CacheStorageService {
  constructor(@Inject(STORAGE_SERVICE) private readonly storageService: StorageService) { }

  cacheData(key: string, value: Record<string, string>, ttl: number): Effect.Effect<void, Error> {
    return this.storageService.setMap(key, value, ttl);
  }

  getCachedData(key: string): Effect.Effect<Option.Option<Record<string, string>>, Error> {
    return this.storageService.getMap(key);
  }

  deleteCache(key: string): Effect.Effect<void, Error> {
    return this.storageService.delete(key);
  }
}
