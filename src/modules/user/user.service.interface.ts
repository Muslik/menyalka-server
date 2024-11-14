import { Effect, Option } from 'effect';

import { ProviderId, RoleId, User, UserId, Username, UserWithRoles } from '~/libs/database';

import { UserWithSocialCredentialsDto } from './dto/userWithSocialCredentials.dto';
import { UserIdInvalidError } from './user.errors';

export interface IUserService {
  getUsers(): Effect.Effect<User[]>;
  getUserByUsername(username: Username): Effect.Effect<Option.Option<User>>;
  createUserWithSocialCredentials(user: UserWithSocialCredentialsDto): Effect.Effect<User>;
  getUserWithRolesById(userId: UserId): Effect.Effect<Option.Option<UserWithRoles>>;
  getUserWithRolesByProviderId(providerUserId: ProviderId): Effect.Effect<Option.Option<UserWithRoles>>;
  assignRoleToUser(userId: UserId, roleId: RoleId): Effect.Effect<void, UserIdInvalidError>;
}
