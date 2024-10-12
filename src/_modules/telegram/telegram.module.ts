import { Module } from '@nestjs/common';

import { TelegramAuthService } from './services/auth/telegram-auth.service';
import { TELEGRAM_AUTH_SERVICE } from './telegram.constants';
import { ConfigModule } from '~/infrastructure/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TELEGRAM_AUTH_SERVICE,
      useClass: TelegramAuthService,
    },
  ],
  exports: [TELEGRAM_AUTH_SERVICE],
})
export class TelegramModule { }
