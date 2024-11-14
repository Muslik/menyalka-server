import { it } from '@effect/vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { Effect, Exit, Option } from 'effect';

import { Config, CONFIG_SERVICE } from '~/config';
import { ProviderId, UserId } from '~/libs/database';
import { Sex } from '~/modules/user';

import { AUTH_SERVICE_OPTIONS, OAUTH_FACTORY_SERIVCE } from '../../auth.constants';
import { InvalidCredentialsError, UnauthorizedError, UnknownProviderError } from '../../auth.errors';
import { SignUpDto } from '../../dto/signUp.dto';
import { UserAuthDto } from '../../dto/userAuth.dto';
import { Provider } from '../oauth/oauth-factory.service.interface';
import { AuthService } from './auth.service';
import { AuthString } from './auth.service.interface';

const configMock: Partial<Config> = {};

const authServiceOptionsMock = {
  getUserByProviderId: vitest.fn(),
  getUserById: vitest.fn(),
  createUserWithSocialCredentials: vitest.fn(),
};

const oauthFactoryServiceMock = {
  getProvider: vitest.fn(),
  getProviderService: vitest.fn(),
};

describe('Auth service', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CONFIG_SERVICE,
          useValue: configMock,
        },
        {
          provide: OAUTH_FACTORY_SERIVCE,
          useValue: oauthFactoryServiceMock,
        },
        {
          provide: AUTH_SERVICE_OPTIONS,
          useValue: authServiceOptionsMock,
        },
        AuthService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  describe('signInOauth', () => {
    it.effect('Should return an error if authString is empty', () =>
      Effect.gen(function* () {
        const result = yield* Effect.exit(authService.signInOauth(AuthString('')));

        expect(result).toStrictEqual(Exit.fail(new UnauthorizedError()));
      }),
    );

    it.effect('Should return an error if provider service is not found', () =>
      Effect.gen(function* () {
        const authString = AuthString('provider token');

        oauthFactoryServiceMock.getProviderService.mockReturnValueOnce(Effect.fail(new UnknownProviderError()));

        const result = yield* Effect.exit(authService.signInOauth(authString));

        expect(oauthFactoryServiceMock.getProviderService).toHaveBeenCalledWith('provider');
        expect(result).toStrictEqual(Exit.fail(new UnknownProviderError()));
      }),
    );

    it.effect('Should return an error if credentials is invalid', () =>
      Effect.gen(function* () {
        const authString = AuthString('provider token');

        oauthFactoryServiceMock.getProviderService.mockReturnValueOnce(
          Effect.succeed({
            getUserInfo: () => Effect.fail(new InvalidCredentialsError()),
          }),
        );

        const result = yield* Effect.exit(authService.signInOauth(authString));

        expect(result).toStrictEqual(Exit.fail(new InvalidCredentialsError()));
      }),
    );

    it.effect('Should return user on success', () =>
      Effect.gen(function* () {
        const authString = AuthString('tma token');
        const mockUser = {
          id: UserId(1),
          username: 'test',
          sex: null,
          role: { id: 1, name: 'User', rolesToPermissions: [] },
        };
        const mockUserAuthDto = new UserAuthDto();
        mockUserAuthDto.id = mockUser.id;
        mockUserAuthDto.username = mockUser.username;
        mockUserAuthDto.sex = Sex.None;
        mockUserAuthDto.permissions = [];

        authServiceOptionsMock.getUserByProviderId.mockReturnValueOnce(Effect.succeed(Option.some(mockUser)));
        oauthFactoryServiceMock.getProviderService.mockReturnValueOnce(
          Effect.succeed({
            getUserInfo: () => Effect.succeed(ProviderId('someId')),
          }),
        );

        const result = yield* Effect.exit(authService.signInOauth(authString));

        expect(result).toStrictEqual(Exit.succeed(Option.some(mockUserAuthDto)));
      }),
    );
  });

  describe('signUpOauth', () => {
    it.effect('Should return an error if authString is empty', () =>
      Effect.gen(function* () {
        const result = yield* Effect.exit(authService.signUpOauth(new SignUpDto(), AuthString('')));

        expect(result).toStrictEqual(Exit.fail(new UnauthorizedError()));
      }),
    );

    it.effect('Should return an error if provider is not found', () =>
      Effect.gen(function* () {
        const authString = AuthString('provider token');

        oauthFactoryServiceMock.getProvider.mockReturnValueOnce(Effect.fail(new UnknownProviderError()));

        const result = yield* Effect.exit(authService.signUpOauth(new SignUpDto(), authString));

        expect(oauthFactoryServiceMock.getProvider).toHaveBeenCalledWith('provider');
        expect(result).toStrictEqual(Exit.fail(new UnknownProviderError()));
      }),
    );

    it.effect('Should return an error if provider service is not found', () =>
      Effect.gen(function* () {
        const authString = AuthString('provider token');

        oauthFactoryServiceMock.getProvider.mockReturnValueOnce(Effect.succeed(Provider.telegram));
        oauthFactoryServiceMock.getProviderService.mockReturnValueOnce(Effect.fail(new UnknownProviderError()));

        const result = yield* Effect.exit(authService.signUpOauth(new SignUpDto(), authString));

        expect(oauthFactoryServiceMock.getProviderService).toHaveBeenCalledWith('provider');
        expect(result).toStrictEqual(Exit.fail(new UnknownProviderError()));
      }),
    );

    it.effect('Should return an error if credentials is invalid', () =>
      Effect.gen(function* () {
        const authString = AuthString('provider token');

        oauthFactoryServiceMock.getProvider.mockReturnValueOnce(Effect.succeed(Provider.telegram));
        oauthFactoryServiceMock.getProviderService.mockReturnValueOnce(
          Effect.succeed({
            getUserInfo: () => Effect.fail(new InvalidCredentialsError()),
          }),
        );

        const result = yield* Effect.exit(authService.signUpOauth(new SignUpDto(), authString));

        expect(result).toStrictEqual(Exit.fail(new InvalidCredentialsError()));
      }),
    );

    it.effect('Should successfully create user', () =>
      Effect.gen(function* () {
        const authString = AuthString('tma token');
        const mockUser = {
          id: UserId(1),
          username: 'test',
          sex: null,
          role: { id: 1, name: 'User', rolesToPermissions: [] },
        };
        const mockUserAuthDto = new UserAuthDto();
        mockUserAuthDto.id = mockUser.id;
        mockUserAuthDto.username = mockUser.username;
        mockUserAuthDto.sex = Sex.None;
        mockUserAuthDto.permissions = [];

        oauthFactoryServiceMock.getProvider.mockReturnValueOnce(Effect.succeed(Provider.telegram));
        oauthFactoryServiceMock.getProviderService.mockReturnValueOnce(
          Effect.succeed({
            getUserInfo: () => Effect.succeed(ProviderId('someId')),
          }),
        );
        authServiceOptionsMock.createUserWithSocialCredentials.mockReturnValueOnce(mockUser);

        const result = yield* Effect.exit(authService.signUpOauth(new SignUpDto(), authString));

        expect(result).toStrictEqual(Exit.succeed(mockUserAuthDto));
      }),
    );
  });

  describe('getAuthUser', () => {
    it.effect('Should return user by id', () =>
      Effect.gen(function* () {
        const mockUser = {
          id: UserId(1),
          username: 'test',
          sex: null,
          role: { id: 1, name: 'User', rolesToPermissions: [] },
        };
        const mockUserAuthDto = new UserAuthDto();
        mockUserAuthDto.id = mockUser.id;
        mockUserAuthDto.username = mockUser.username;
        mockUserAuthDto.sex = Sex.None;
        mockUserAuthDto.permissions = [];

        authServiceOptionsMock.getUserById.mockReturnValueOnce(Effect.succeed(Option.some(mockUser)));
        const result = yield* Effect.exit(authService.getAuthUser(UserId(123)));

        expect(authServiceOptionsMock.getUserById).toHaveBeenCalledWith(UserId(123));
        expect(result).toStrictEqual(Exit.succeed(Option.some(mockUserAuthDto)));
      }),
    );
  });
});
