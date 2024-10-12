import { Effect, Option } from 'effect';

import { B, User, UserWithRoles } from '~/infrastructure/database';

import { UserWithSocialCredentialsDto } from './dto/userWithSocialCredentials.dto';
import { UserIdInvalidError } from './user.errors';

export interface IUserService {
  getUsers(): Effect.Effect<User[], Error>;
  getUserByEmail(email: B.Email): Effect.Effect<Option.Option<User>, Error>;
  getUserByUsername(username: B.Username): Effect.Effect<Option.Option<User>, Error>;
  getUserWithRolesById(userId: B.UserId): Effect.Effect<Option.Option<UserWithRoles>, Error>;
  getUserByProviderId(providerUserId: B.ProviderUserId): Effect.Effect<Option.Option<UserWithRoles>, Error>;
  createUserWithSocialCredentials(user: UserWithSocialCredentialsDto): Effect.Effect<UserWithRoles, Error>;
  assignRoleToUser(userId: B.UserId, roleId: B.RoleId): Effect.Effect<void, UserIdInvalidError | Error>;
}
