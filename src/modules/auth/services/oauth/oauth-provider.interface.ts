import { Effect } from 'effect';

import { ProviderId } from '~/libs/database';

import { InvalidCredentialsError } from '../../auth.errors';
import { AuthToken } from '../auth/auth.service.interface';

export interface IOauthProvider {
  getUserInfo(authData: AuthToken): Effect.Effect<ProviderId, InvalidCredentialsError>;
}
