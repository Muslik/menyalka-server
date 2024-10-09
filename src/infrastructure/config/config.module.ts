import { Module } from '@nestjs/common';
import { ConfigModule as NestjsConfigModule } from '@nestjs/config';

import { CONFIG_SERVICE } from './config.constants';
import { configSchema } from './config.schema';
import { ConfigService, NODE_ENV, config } from './config.service';

@Module({
  imports: [NestjsConfigModule],
  providers: [
    {
      provide: CONFIG_SERVICE,
      useClass: ConfigService,
    },
  ],
  exports: [CONFIG_SERVICE],
})
export class ConfigModule {
  static forRoot() {
    return {
      module: ConfigModule,
      imports: [
        NestjsConfigModule.forRoot({
          load: [config],
          isGlobal: false,
          envFilePath: NODE_ENV === 'production' ? '.env' : `.env.${NODE_ENV}`,
          validationSchema: configSchema,
        }),
      ],
    };
  }
}
