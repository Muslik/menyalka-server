import { it } from '@effect/vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { Option, Effect, Exit } from 'effect';

import { RBAC } from '~/config';
import { ProviderId, RoleId, TRANSACTION_REPOSITORY, UserId, Username } from '~/libs/database';

import { UserWithSocialCredentialsDto } from './dto/userWithSocialCredentials.dto';
import { USER_REPOSITORY, USER_SOCIAL_CREDENTIALS_REPOSITORY } from './user.constants';
import { UserIdInvalidError } from './user.errors';
import { UserService } from './user.service';

const userRepositoryMock = {
  findOne: vitest.fn(),
  save: vitest.fn(),
  findAll: vitest.fn(),
  findUserByProviderIdWithRoles: vitest.fn(),
  findUserWithRoles: vitest.fn(),
  findUserByUsername: vitest.fn(),
};

const userSocialCredentialsRepositoryMock = {
  insert: vitest.fn(),
};

const transactionRepositoryMock = {
  withTransaction: (cb: () => Effect.Effect<any>) => Effect.promise(() => Effect.runPromise(cb())),
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: USER_REPOSITORY,
          useValue: userRepositoryMock,
        },
        {
          provide: USER_SOCIAL_CREDENTIALS_REPOSITORY,
          useValue: userSocialCredentialsRepositoryMock,
        },
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: transactionRepositoryMock,
        },
        UserService,
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  describe('assignRoleToUser', () => {
    it.effect('assignRoleToUser should save user with new role if user exists', () =>
      Effect.gen(function* () {
        const userId = UserId(1);
        const roleId = RoleId(2);
        const mockUser = { id: userId, roleId: RoleId(1) };
        userRepositoryMock.findOne.mockReturnValueOnce(Effect.succeed(Option.some(mockUser)));
        userRepositoryMock.save.mockReturnValueOnce(Effect.succeed({ ...mockUser, roleId }));

        const result = yield* Effect.exit(userService.assignRoleToUser(userId, roleId));

        expect(result).toStrictEqual(Exit.void);
        expect(userRepositoryMock.save).toHaveBeenCalledWith({ ...mockUser, roleId });
      }),
    );

    it.effect('assignRoleToUser should return UserIdInvalidError if user does not exist', () =>
      Effect.gen(function* () {
        const userId = UserId(1);
        const roleId = RoleId(2);
        userRepositoryMock.findOne.mockReturnValueOnce(Effect.succeed(Option.none()));

        const result = yield* Effect.exit(userService.assignRoleToUser(userId, roleId));

        expect(result).toStrictEqual(Exit.fail(new UserIdInvalidError()));
        expect(userRepositoryMock.save).not.toHaveBeenCalled();
      }),
    );
  });

  it.effect('getUsers should return list of users', () =>
    Effect.gen(function* () {
      const mockUsers = [
        { id: UserId(1), username: 'user1' },
        { id: UserId(2), username: 'user2' },
      ];
      userRepositoryMock.findAll.mockReturnValueOnce(Effect.succeed(mockUsers));

      const result = yield* Effect.exit(userService.getUsers());

      expect(result).toStrictEqual(Exit.succeed(mockUsers));
    }),
  );
  it.effect('getUserWithRolesByProviderId should return user with roles if found', () =>
    Effect.gen(function* () {
      const providerUserId = ProviderId('provider-id');
      const mockUserWithRoles = { id: UserId(1), roles: ['User'] };
      userRepositoryMock.findUserByProviderIdWithRoles.mockReturnValueOnce(
        Effect.succeed(Option.some(mockUserWithRoles)),
      );

      const result = yield* Effect.exit(userService.getUserWithRolesByProviderId(providerUserId));

      expect(result).toStrictEqual(Exit.succeed(Option.some(mockUserWithRoles)));
    }),
  );

  it.effect('getUserWithRolesById should return user with roles if found', () =>
    Effect.gen(function* () {
      const userId = UserId(1);
      const mockUserWithRoles = { id: userId, roles: ['User'] };
      userRepositoryMock.findUserWithRoles.mockReturnValueOnce(Effect.succeed(Option.some(mockUserWithRoles)));

      const result = yield* Effect.exit(userService.getUserWithRolesById(userId));

      expect(result).toStrictEqual(Exit.succeed(Option.some(mockUserWithRoles)));
    }),
  );

  it.effect('getUserByUsername should return user if found', () =>
    Effect.gen(function* () {
      const username = Username('testUser');
      const mockUser = { id: UserId(1), username };
      userRepositoryMock.findUserByUsername.mockReturnValueOnce(Effect.succeed(Option.some(mockUser)));

      const result = yield* Effect.exit(userService.getUserByUsername(username));

      expect(result).toStrictEqual(Exit.succeed(Option.some(mockUser)));
    }),
  );

  it.effect('createUserWithSocialCredentials should save user and social credentials', () =>
    Effect.gen(function* () {
      const userDto: UserWithSocialCredentialsDto = {
        username: Username('testUser'),
        providerId: ProviderId('provider-id'),
        providerType: 'SomeProviderType',
      };
      const newUser = { id: UserId(1), username: userDto.username, roleId: RoleId(1) };

      userRepositoryMock.save.mockReturnValueOnce(Effect.succeed(newUser));
      userSocialCredentialsRepositoryMock.insert.mockReturnValueOnce(Effect.succeed(userDto));

      const result = yield* Effect.exit(userService.createUserWithSocialCredentials(userDto));

      expect(userRepositoryMock.save).toHaveBeenCalledWith({
        username: userDto.username,
        roleId: RoleId(RBAC.RoleId.User),
      });
      expect(userSocialCredentialsRepositoryMock.insert).toHaveBeenCalledWith({
        userId: newUser.id,
        providerId: userDto.providerId,
        providerType: userDto.providerType,
      });
      expect(result).toStrictEqual(Exit.succeed(newUser));
    }),
  );
});
