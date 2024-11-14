import { Inject, Injectable } from '@nestjs/common';
import { validate, parse, InitData } from '@telegram-apps/init-data-node';
import { Effect, pipe } from 'effect';

import { CONFIG_SERVICE, IConfigService } from '~/config';

import { ITelegramAuthService } from './telegram-auth.service.interface';

@Injectable()
export class TelegramAuthService implements ITelegramAuthService {
  constructor(@Inject(CONFIG_SERVICE) private readonly configService: IConfigService) {}

  validateAuthData(authData: string): Effect.Effect<InitData, Error> {
    return Effect.if(!!this.configService.isDevelopment, {
      onTrue: () => Effect.try(() => parse(authData)),
      onFalse: () =>
        pipe(
          Effect.try(() => validate(authData, this.configService.telegram.botToken)),
          Effect.andThen(() => Effect.try(() => parse(authData))),
        ),
    });
  }
}
