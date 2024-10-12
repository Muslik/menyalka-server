import { Effect } from 'effect';
import { UnauthorizedError } from '../../auth.errors';
import { B } from '~/infrastructure/database';
import { AuthData } from '../auth/auth.service.interface';

export interface IOauthProvider {
  getUserInfo(authData: AuthData): Effect.Effect<B.ProviderUserId, UnauthorizedError>;
}
