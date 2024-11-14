import { ConfigurableModuleBuilder, DynamicModule, Global } from '@nestjs/common';

import { DATABASE } from './database.constants';
import { DrizzlePostgresConfig, DrizzlePostgresService } from './drizzle/drizzle.postgres.service';

type ModuleConfig = DrizzlePostgresConfig;

const { ASYNC_OPTIONS_TYPE, MODULE_OPTIONS_TOKEN, ConfigurableModuleClass } =
  new ConfigurableModuleBuilder<ModuleConfig>()
    .setExtras(
      {
        tag: DATABASE,
      },
      (definition, extras) => ({
        ...definition,
        tag: extras.tag,
      }),
    )
    .build();

@Global()
export class DatabaseModule extends ConfigurableModuleClass {
  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const { providers = [], exports = [], ...props } = super.registerAsync(options);

    return {
      ...props,
      providers: [
        ...providers,
        DrizzlePostgresService,
        {
          provide: options.tag || DATABASE,
          useFactory: async (drizzleService: DrizzlePostgresService, config: DrizzlePostgresConfig) => {
            return drizzleService.getDrizzle(config);
          },
          inject: [DrizzlePostgresService, MODULE_OPTIONS_TOKEN],
        },
      ],
      exports: [...exports, options?.tag || DATABASE],
    };
  }
}
