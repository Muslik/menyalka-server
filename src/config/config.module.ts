import { Module } from '@nestjs/common';

import { CONFIG_SERVICE } from './config.constants';
import { AppConfigService } from './config.service';

@Module({
  providers: [
    {
      provide: CONFIG_SERVICE,
      useClass: AppConfigService,
    },
  ],
  exports: [CONFIG_SERVICE],
})
export class AppConfigModule {}
