import { Inject, Injectable } from '@nestjs/common';
import { Effect } from 'effect';

import { TELEGRAM_OAUTH_SERVICE } from '../../auth.constants';
import { UnknownProviderError } from '../../auth.errors';
import { AuthProvider } from '../auth/auth.service.interface';
import { IOAuthFactoryService, Provider } from './oauth-factory.service.interface';
import { IOauthProvider } from './oauth-provider.interface';

@Injectable()
export class OAuthFactoryService implements IOAuthFactoryService {
  constructor(@Inject(TELEGRAM_OAUTH_SERVICE) private readonly telegramOAuthService: IOauthProvider) {}

  getProvider(authProvider: AuthProvider): Effect.Effect<Provider, UnknownProviderError> {
    if (Provider.telegram === authProvider) {
      return Effect.succeed(Provider.telegram);
    }

    return Effect.fail(new UnknownProviderError());
  }

  getProviderService(authProvider: AuthProvider): Effect.Effect<IOauthProvider, UnknownProviderError> {
    if (Provider.telegram === authProvider) {
      return Effect.succeed(this.telegramOAuthService);
    }

    return Effect.fail(new UnknownProviderError());
  }
}
