import { Module } from '@nestjs/common';

import { ConfigModule } from '~/configs';

import { TELEGRAM_SERVICE } from './telegram.di-tokens';
import { TelegramService } from './telegram.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TELEGRAM_SERVICE,
      useClass: TelegramService,
    },
  ],
  exports: [TELEGRAM_SERVICE],
})
export class TelegramModule { }

