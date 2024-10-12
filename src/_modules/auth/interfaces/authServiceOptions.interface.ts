import { Effect, Option } from 'effect';

import { B, UserWithRoles } from '~/infrastructure/database';
import { Session, SessionCreateDto } from '~/modules/session';
import { InitData } from '~/modules/telegram';

export interface IAuthServiceOptions {
  getUserByProviderId(providerUserId: B.ProviderUserId): Effect.Effect<Option.Option<UserWithRoles>, Error>;
  createUserWithSocialCredentials(userWithSocialCredentials: {
    username: string;
    providerType: string;
    providerUserId: B.ProviderUserId;
  }): Effect.Effect<UserWithRoles, Error>;
  getUserById(userId: number): Effect.Effect<Option.Option<UserWithRoles>, Error>;
  telegramValidateAuthData(authData: string): Effect.Effect<InitData, Error>;
  createSession(sessionCreateDto: SessionCreateDto): Effect.Effect<Session, Error>;
}
