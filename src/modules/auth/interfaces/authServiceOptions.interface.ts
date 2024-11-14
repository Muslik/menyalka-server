import { Effect, Option } from 'effect';

import { ProviderId, User, Username, UserWithRoles } from '~/libs/database';
import { Session, SessionCreateDto } from '~/modules/session';
import { InitData } from '~/modules/telegram';

export interface IAuthServiceOptions {
  getUserByProviderId(providerUserId: ProviderId): Effect.Effect<Option.Option<UserWithRoles>>;
  createUserWithSocialCredentials(userWithSocialCredentials: {
    username: Username;
    providerType: string;
    providerId: ProviderId;
  }): Effect.Effect<User>;
  getUserById(userId: number): Effect.Effect<Option.Option<UserWithRoles>>;
  getUserByUsername(username: Username): Effect.Effect<Option.Option<User>>;
  telegramValidateAuthData(authData: string): Effect.Effect<InitData, Error>;
  createSession(sessionCreateDto: SessionCreateDto): Effect.Effect<Session>;
  deleteSession(sessionId: string): Effect.Effect<void>;
}
