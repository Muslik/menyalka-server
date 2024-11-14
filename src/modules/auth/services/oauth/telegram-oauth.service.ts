import { Inject, Injectable } from '@nestjs/common';
import { Effect, pipe } from 'effect';

import { ProviderId } from '~/libs/database';

import { AUTH_SERVICE_OPTIONS } from '../../auth.constants';
import { InvalidCredentialsError } from '../../auth.errors';
import { IAuthServiceOptions } from '../../interfaces/authServiceOptions.interface';
import { AuthToken } from '../auth/auth.service.interface';
import { IOauthProvider } from './oauth-provider.interface';

@Injectable()
export class TelegramOauthService implements IOauthProvider {
  constructor(@Inject(AUTH_SERVICE_OPTIONS) private authServiceOptions: IAuthServiceOptions) {}

  getUserInfo(authData: AuthToken): Effect.Effect<ProviderId, InvalidCredentialsError> {
    return pipe(
      this.authServiceOptions.telegramValidateAuthData(authData),
      Effect.andThen((data) => ProviderId(String(data.user?.id))),
      Effect.mapError(() => new InvalidCredentialsError()),
    );
  }
}
