import { Effect, Option } from 'effect';

import { User, B, UserInsert, UserWithRoles } from '~/infrastructure/database';

export interface IUserRepository {
  save(entity: UserInsert): Effect.Effect<User, Error>;
  findOne(userId: B.UserId): Effect.Effect<Option.Option<User>, Error>;
  findAll(): Effect.Effect<User[], Error>;
  findUserByUsername(username: B.Username): Effect.Effect<Option.Option<User>, Error>;
  findUserByEmail(email: B.Email): Effect.Effect<Option.Option<User>, Error>;
  findUserByProviderIdWithRoles(providerUserId: B.ProviderUserId): Effect.Effect<Option.Option<UserWithRoles>, Error>;
  findUserWithRoles(userId: B.UserId): Effect.Effect<Option.Option<UserWithRoles>, Error>;
}
