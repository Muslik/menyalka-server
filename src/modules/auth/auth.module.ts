import { DynamicModule, Module } from '@nestjs/common';
import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { AUTH_SERVICE, AUTH_SERVICE_OPTIONS, OAUTH_FACTORY_SERIVCE, TELEGRAM_OAUTH_SERVICE } from './auth.constants';
import { AuthController } from './auth.controller';
import { IAuthServiceOptions } from './interfaces/authServiceOptions.interface';
import { AuthService } from './services/auth/auth.service';
import { OAuthFactoryService } from './services/oauth/oauth-factory.service';
import { TelegramOauthService } from './services/oauth/telegram-oauth.service';

interface AuthModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: FactoryProvider<IAuthServiceOptions>['useFactory'];
  inject?: FactoryProvider['inject'];
}

@Module({
  providers: [
    {
      provide: OAUTH_FACTORY_SERIVCE,
      useClass: OAuthFactoryService,
    },
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
    {
      provide: TELEGRAM_OAUTH_SERVICE,
      useClass: TelegramOauthService,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {
  static forRootAsync(options: AuthModuleAsyncOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: options.imports,
      providers: [
        {
          provide: AUTH_SERVICE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
      ],
    };
  }
}
