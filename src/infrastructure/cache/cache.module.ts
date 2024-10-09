import { RedisService } from '@liaoliaots/nestjs-redis';
import { Global, Module } from '@nestjs/common';

import { RedisStorageService } from '../storage/redis-storage.service';
import { STORAGE_SERVICE } from '../storage/storage.service.constants';
import { CacheStorageService } from './cache-storage.service';
import { CACHE_STORAGE_NAME, CACHE_STORAGE_SERVICE } from './cache.constant';

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      useFactory: (redisService: RedisService) => {
        return new RedisStorageService(redisService, CACHE_STORAGE_NAME);
      },
      inject: [RedisService],
    },
    {
      provide: CACHE_STORAGE_SERVICE,
      useClass: CacheStorageService,
    },
  ],
})
export class CacheModule {}
