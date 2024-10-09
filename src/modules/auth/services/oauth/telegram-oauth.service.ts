import { Inject, Injectable } from '@nestjs/common';
import { Effect, pipe } from 'effect';

import { B } from '~/infrastructure/database';

import { AUTH_SERVICE_OPTIONS } from '../../auth.constants';
import { UnauthorizedError } from '../../auth.errors';
import { IAuthServiceOptions } from '../../interfaces/authServiceOptions.interface';
import { IOauthProvider } from './oauth-provider.interface';
import { AuthData } from '../auth/auth.service.interface';

@Injectable()
export class TelegramOauthService implements IOauthProvider {
  constructor(@Inject(AUTH_SERVICE_OPTIONS) private authServiceOptions: IAuthServiceOptions) {}

  getUserInfo(authData: AuthData): Effect.Effect<B.ProviderUserId, UnauthorizedError> {
    return pipe(
      this.authServiceOptions.telegramValidateAuthData(authData),
      Effect.andThen((data) => B.ProviderUserId(String(data.user?.id))),
      Effect.mapError(() => new UnauthorizedError()),
    );
  }
}
