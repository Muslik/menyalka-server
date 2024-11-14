import { it } from '@effect/vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { Effect, Exit, Option } from 'effect';
import { FastifyReply } from 'fastify';

import { Config, CONFIG_SERVICE } from '~/config';
import { UserId, UserWithRoles } from '~/libs/database';
import { UserIdentity } from '~/libs/decorators';
import { Sex } from '~/modules/user';

import { Session, SessionId } from '../session';
import { AUTH_SERVICE, AUTH_SERVICE_OPTIONS } from './auth.constants';
import { AuthController } from './auth.controller';
import { UnauthorizedError, UnknownProviderError, UsernameAlreadyExistsError } from './auth.errors';
import { SignInStatus } from './dto/signInResponse.dto';
import { SignUpDto } from './dto/signUp.dto';
import { UserAuthDto } from './dto/userAuth.dto';
import { AuthString } from './services/auth/auth.service.interface';

const configMock: Partial<Config> = {};

const authServiceOptionsMock = {
  getUserByProviderId: vitest.fn(),
  getUserById: vitest.fn(),
  getUserByUsername: vitest.fn(),
  createSession: vitest.fn(),
  deleteSession: vitest.fn(),
  createUserWithSocialCredentials: vitest.fn(),
};

const authServiceMock = {
  signInOauth: vitest.fn(),
  signUpOauth: vitest.fn(),
  getAuthUser: vitest.fn(),
};

const responseMock = {
  setCookie: vitest.fn(),
  clearCookie: vitest.fn(),
  header: vitest.fn(),
  send: vitest.fn(),
} as unknown as FastifyReply;

const createSessionMock = () => {
  return new Session({
    sessionId: SessionId('some-id'),
    userAgent: 'user-agent',
    ip: 'ip',
    createdAt: new Date(),
    lastAccessAt: new Date(),
    userId: UserId(1),
  });
};
const createUserMock = () => {
  const mockUserAuthDto = new UserAuthDto();

  mockUserAuthDto.id = UserId(1);
  mockUserAuthDto.username = 'username';
  mockUserAuthDto.sex = Sex.None;
  mockUserAuthDto.permissions = [];

  return mockUserAuthDto;
};

const userIdentityMock: UserIdentity = { ip: '127.0.0.1', userAgent: 'test-agent' };
const authorizationMock = AuthString('tma test-token');

describe('Auth controller', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CONFIG_SERVICE,
          useValue: configMock,
        },
        {
          provide: AUTH_SERVICE_OPTIONS,
          useValue: authServiceOptionsMock,
        },
        {
          provide: AUTH_SERVICE,
          useValue: authServiceMock,
        },
        AuthController,
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  describe('oauth/sign-in', () => {
    it.effect('Should return an error on unknown provider', () =>
      Effect.gen(function* () {
        authServiceMock.signInOauth.mockImplementationOnce(() => Effect.fail(new UnknownProviderError()));

        const result = yield* Effect.promise(() =>
          authController.oauthSignIn(responseMock, userIdentityMock, authorizationMock),
        );

        expect(result).toStrictEqual(Exit.fail(new UnknownProviderError()));
      }),
    );

    it.effect('Should set session on user exist', () =>
      Effect.gen(function* () {
        authServiceMock.signInOauth.mockImplementationOnce(() => Effect.succeed(Option.some(createUserMock())));
        authServiceOptionsMock.createSession.mockImplementationOnce(() => Effect.succeed(createSessionMock()));

        const result = yield* Effect.promise(() =>
          authController.oauthSignIn(responseMock, userIdentityMock, authorizationMock),
        );

        expect(responseMock.setCookie).toHaveBeenCalledWith('sessionId', SessionId('some-id'), expect.any(Object));

        expect(result).toStrictEqual(Exit.succeed({ status: SignInStatus.success }));
      }),
    );

    it.effect("Shouldn' set session on user non exist", () =>
      Effect.gen(function* () {
        authServiceMock.signInOauth.mockImplementationOnce(() => Effect.succeed(Option.none()));

        const result = yield* Effect.promise(() =>
          authController.oauthSignIn(responseMock, userIdentityMock, authorizationMock),
        );

        expect(responseMock.setCookie).not.toHaveBeenCalled();

        expect(result).toStrictEqual(Exit.succeed({ status: SignInStatus.needSignUp }));
      }),
    );
  });

  describe('oauth/sign-up', () => {
    it.effect('Should return an error on user already exist error', () =>
      Effect.gen(function* () {
        authServiceOptionsMock.getUserByUsername.mockImplementationOnce(() =>
          Effect.succeed(Option.some(createUserMock())),
        );

        const result = yield* Effect.promise(() =>
          authController.oauthSignUp(responseMock, userIdentityMock, {} as SignUpDto, authorizationMock),
        );

        expect(result).toStrictEqual(Exit.fail(new UsernameAlreadyExistsError()));
      }),
    );

    it.effect('Should return an error on unknown provider error', () =>
      Effect.gen(function* () {
        authServiceOptionsMock.getUserByUsername.mockImplementationOnce(() => Effect.succeed(Option.none()));
        authServiceMock.signUpOauth.mockImplementationOnce(() => Effect.fail(new UnknownProviderError()));

        const result = yield* Effect.promise(() =>
          authController.oauthSignUp(responseMock, userIdentityMock, {} as SignUpDto, authorizationMock),
        );

        expect(result).toStrictEqual(Exit.fail(new UnknownProviderError()));
      }),
    );

    it.effect('Should create session on success signUp', () =>
      Effect.gen(function* () {
        authServiceOptionsMock.getUserByUsername.mockImplementationOnce(() => Effect.succeed(Option.none()));
        authServiceOptionsMock.createSession.mockImplementationOnce(() => Effect.succeed(createSessionMock()));
        authServiceMock.signUpOauth.mockImplementationOnce(() => Effect.succeed(createUserMock()));

        yield* Effect.promise(() =>
          authController.oauthSignUp(responseMock, userIdentityMock, {} as SignUpDto, authorizationMock),
        );

        expect(responseMock.setCookie).toHaveBeenCalledWith('sessionId', SessionId('some-id'), {
          httpOnly: true,
          path: '/',
          secure: true,
          sameSite: 'none',
          maxAge: expect.any(Number),
        });
      }),
    );
  });

  describe('/me', () => {
    it.effect('Should return user on success', () =>
      Effect.gen(function* () {
        const userMock = createUserMock();
        authServiceMock.getAuthUser.mockImplementationOnce(() => Effect.succeed(Option.some(userMock)));

        const result = yield* Effect.promise(() => authController.me({} as UserWithRoles));

        expect(result).toStrictEqual(Exit.succeed(userMock));
      }),
    );

    it.effect('Should return an error on unauthorized', () =>
      Effect.gen(function* () {
        authServiceMock.getAuthUser.mockImplementationOnce(() => Effect.succeed(Option.none()));

        const result = yield* Effect.promise(() => authController.me({} as UserWithRoles));

        expect(result).toStrictEqual(Exit.fail(new UnauthorizedError()));
      }),
    );
  });

  describe('/logout', () => {
    it.effect('Should clear session', () =>
      Effect.gen(function* () {
        authServiceOptionsMock.deleteSession.mockImplementationOnce(() => Effect.succeed(Effect.void));

        yield* Effect.promise(() => authController.logout(responseMock, { sessionId: SessionId('some-id') }));

        expect(authServiceOptionsMock.deleteSession).toHaveBeenCalledWith(SessionId('some-id'));
        expect(responseMock.clearCookie).toHaveBeenCalledWith('sessionId');
      }),
    );
  });
});
