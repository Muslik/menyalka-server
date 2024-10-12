import { RedisService } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';

import { RedisStorageService } from '~/infrastructure/storage/redis-storage.service';
import { STORAGE_SERVICE } from '~/infrastructure/storage/storage.service.constants';

import { SESSION_SERVICE, SESSIONS_STORAGE_NAME } from './session.constants';
import { SessionService } from './session.service';

@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      useFactory: (redisService: RedisService) => {
        return new RedisStorageService(redisService, SESSIONS_STORAGE_NAME);
      },
      inject: [RedisService],
    },
    {
      provide: SESSION_SERVICE,
      useClass: SessionService,
    },
  ],
  exports: [SESSION_SERVICE],
})
export class SessionModule {}
