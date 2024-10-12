import { Inject, Injectable } from '@nestjs/common';
import { Effect, Option, pipe } from 'effect';

import { RBAC } from '~/infrastructure/config';
import { B, User, UserWithRoles } from '~/infrastructure/database';

import { UserWithSocialCredentialsDto } from './dto/userWithSocialCredentials.dto';
import { IUserRepository } from './repositories/user.repository.interface';
import { IUserSocialCredentialsRepository } from './repositories/userSocialCredentialsRepository.interface';
import { USER_REPOSITORY, USER_SOCIAL_CREDENTIALS_REPOSITORY } from './user.constants';
import { UserIdInvalidError } from './user.errors';
import { IUserService } from './user.service.interface';
import { Transactional } from '~/infrastructure/lib/effect/plugin-transactional';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(USER_SOCIAL_CREDENTIALS_REPOSITORY)
    private readonly userSocialCredentialsRepository: IUserSocialCredentialsRepository,
  ) {}

  assignRoleToUser(userId: B.UserId, roleId: B.RoleId): Effect.Effect<void, UserIdInvalidError | Error> {
    return pipe(
      this.userRepository.findOne(userId),
      Effect.andThen((option) =>
        pipe(
          option,
          Option.match({
            onSome: (user) =>
              pipe(
                this.userRepository.save({ ...user, roleId }),
                Effect.andThen(() => undefined),
              ),
            onNone: () => Effect.fail(new UserIdInvalidError()),
          }),
        ),
      ),
    );
  }

  getUsers(): Effect.Effect<User[], Error> {
    return this.userRepository.findAll();
  }

  getUserByProviderId(providerUserId: B.ProviderUserId): Effect.Effect<Option.Option<UserWithRoles>, Error> {
    return this.userRepository.findUserByProviderIdWithRoles(providerUserId);
  }

  getUserWithRolesById(userId: B.UserId): Effect.Effect<Option.Option<UserWithRoles>, Error> {
    return this.userRepository.findUserWithRoles(userId);
  }

  getUserByUsername(username: B.Username): Effect.Effect<Option.Option<User>, Error> {
    return this.userRepository.findUserByUsername(username);
  }

  getUserByEmail(email: B.Email): Effect.Effect<Option.Option<User>, Error> {
    return this.userRepository.findUserByEmail(email);
  }

  @Transactional()
  createUserWithSocialCredentials(user: UserWithSocialCredentialsDto): Effect.Effect<UserWithRoles, Error> {
    return pipe(
      this.userRepository.save({
        username: user.username,
        roleId: B.RoleId(RBAC.ROLES_MAP[RBAC.Role.User].id),
      }),
      Effect.tap((newUser) =>
        this.userSocialCredentialsRepository.insert({
          userId: newUser.id,
          providerUserId: user.providerUserId,
          providerType: user.providerType,
        }),
      ),
      Effect.andThen((newUser) => this.userRepository.findUserWithRoles(newUser.id)),
      Effect.andThen(Option.map((user) => user)),
    );
  }
}
