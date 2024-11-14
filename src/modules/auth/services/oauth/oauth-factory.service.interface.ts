import { Effect } from 'effect';

import { UnknownProviderError } from '../../auth.errors';
import { AuthProvider } from '../auth/auth.service.interface';
import { IOauthProvider } from './oauth-provider.interface';

export enum Provider {
  telegram = 'tma',
}

export interface IOAuthFactoryService {
  getProvider(authProvider: AuthProvider): Effect.Effect<Provider, UnknownProviderError>;
  getProviderService(authProvider: AuthProvider): Effect.Effect<IOauthProvider, UnknownProviderError>;
}
