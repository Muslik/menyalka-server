import { Effect, Option } from 'effect';

import { ProviderId, User, UserId, UserInsert, Username, UserWithRoles } from '~/libs/database';

export interface IUserRepository {
  save(entity: UserInsert): Effect.Effect<User>;
  findOne(userId: UserId): Effect.Effect<Option.Option<User>>;
  findAll(): Effect.Effect<User[]>;
  findUserByUsername(username: Username): Effect.Effect<Option.Option<User>>;
  findUserByProviderIdWithRoles(providerUserId: ProviderId): Effect.Effect<Option.Option<UserWithRoles>>;
  findUserWithRoles(userId: UserId): Effect.Effect<Option.Option<UserWithRoles>>;
}
