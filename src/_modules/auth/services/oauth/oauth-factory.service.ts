import { Inject, Injectable } from '@nestjs/common';
import { Effect } from 'effect';

import { TELEGRAM_OAUTH_SERVICE } from '../../auth.constants';
import { UnknownProviderError } from '../../auth.errors';
import { IOauthProvider } from './oauth-provider.interface';
import { TelegramOauthService } from './telegram-oauth.service';
import { AuthProvider } from '../auth/auth.service.interface';

export enum OauthProvider {
  telegram = 'tma',
}

@Injectable()
export class OAuthFactoryService {
  constructor(@Inject(TELEGRAM_OAUTH_SERVICE) private readonly telegramOAuthService: TelegramOauthService) {}

  getProvider(authProvider: AuthProvider): Effect.Effect<IOauthProvider, UnknownProviderError> {
    if (OauthProvider.telegram === authProvider) {
      return Effect.succeed(this.telegramOAuthService);
    }

    return Effect.fail(new UnknownProviderError());
  }
}
