import { Inject, Injectable } from '@nestjs/common';
import { Effect, Option, pipe } from 'effect';

import { RBAC } from '~/config';
import {
  ProviderId,
  RoleId,
  TRANSACTION_REPOSITORY,
  TransactionRepository,
  User,
  UserId,
  Username,
  UserWithRoles,
} from '~/libs/database';

import { UserWithSocialCredentialsDto } from './dto/userWithSocialCredentials.dto';
import { IUserRepository } from './repositories/user.repository.interface';
import { IUserSocialCredentialsRepository } from './repositories/userSocialCredentialsRepository.interface';
import { USER_REPOSITORY, USER_SOCIAL_CREDENTIALS_REPOSITORY } from './user.constants';
import { UserIdInvalidError } from './user.errors';
import { IUserService } from './user.service.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(USER_SOCIAL_CREDENTIALS_REPOSITORY)
    private readonly userSocialCredentialsRepository: IUserSocialCredentialsRepository,
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: TransactionRepository,
  ) {}

  assignRoleToUser(userId: UserId, roleId: RoleId): Effect.Effect<void, UserIdInvalidError> {
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

  getUsers(): Effect.Effect<User[]> {
    return this.userRepository.findAll();
  }

  getUserWithRolesByProviderId(providerUserId: ProviderId): Effect.Effect<Option.Option<UserWithRoles>> {
    return this.userRepository.findUserByProviderIdWithRoles(providerUserId);
  }

  getUserWithRolesById(userId: UserId): Effect.Effect<Option.Option<UserWithRoles>> {
    return this.userRepository.findUserWithRoles(userId);
  }

  getUserByUsername(username: Username): Effect.Effect<Option.Option<User>> {
    return this.userRepository.findUserByUsername(username);
  }

  createUserWithSocialCredentials(user: UserWithSocialCredentialsDto): Effect.Effect<User> {
    return this.transactionRepository.withTransaction(() =>
      pipe(
        this.userRepository.save({
          username: user.username,
          roleId: RoleId(RBAC.RoleId.User),
        }),
        Effect.tap((newUser) => {
          console.log('Tap');
          return this.userSocialCredentialsRepository.insert({
            userId: newUser.id,
            providerId: user.providerId,
            providerType: user.providerType,
          });
        }),
      ),
    );
  }
}
