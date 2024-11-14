import { RedisService } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';

import { RedisStorageService, STORAGE_SERVICE } from '~/libs/storage';

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
