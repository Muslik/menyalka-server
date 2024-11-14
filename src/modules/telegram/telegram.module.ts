import { Module } from '@nestjs/common';

import { AppConfigService, CONFIG_SERVICE } from '~/config';

import { TelegramAuthService } from './services/auth/telegram-auth.service';
import { TELEGRAM_AUTH_SERVICE } from './telegram.constants';

@Module({
  providers: [
    {
      provide: CONFIG_SERVICE,
      useClass: AppConfigService,
    },
    {
      provide: TELEGRAM_AUTH_SERVICE,
      useClass: TelegramAuthService,
    },
  ],
  exports: [TELEGRAM_AUTH_SERVICE],
})
export class TelegramModule {}
