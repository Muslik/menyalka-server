import { Inject, Injectable } from '@nestjs/common';
import { validate, parse } from '@telegram-apps/init-data-node';
import { Effect, pipe } from 'effect';

import { CONFIG_SERVICE, ConfigPort } from '~/configs';

import { AuthData, TelegramServicePort } from './telegram-service.port';

@Injectable()
export class TelegramService implements TelegramServicePort {
  constructor(@Inject(CONFIG_SERVICE) private readonly configService: ConfigPort) { }

  validateAuthData(authData: string): Effect.Effect<AuthData, Error> {
    return pipe(
      Effect.try(() => validate(authData, this.configService.telegram.botToken)),
      Effect.andThen(parse),
      Effect.andThen((data) => (data.user ? Effect.succeed(data.user) : Effect.fail(new Error('User not found')))),
    );
  }
}
