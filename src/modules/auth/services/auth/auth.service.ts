import { Inject, Injectable } from '@nestjs/common';
import { Option, Effect, pipe } from 'effect';

import { RBAC } from '~/config';
import { ProviderId, User, Username, UserWithRoles } from '~/libs/database';
import { fromSexPersistance } from '~/modules/user';

import { AUTH_SERVICE_OPTIONS, OAUTH_FACTORY_SERIVCE } from '../../auth.constants';
import { InvalidCredentialsError, UnauthorizedError, UnknownProviderError } from '../../auth.errors';
import { SignUpDto } from '../../dto/signUp.dto';
import { UserAuthDto } from '../../dto/userAuth.dto';
import { IAuthServiceOptions } from '../../interfaces/authServiceOptions.interface';
import { IOAuthFactoryService } from '../oauth/oauth-factory.service.interface';
import { AuthToken, AuthProvider, AuthString, IAuthService } from './auth.service.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(AUTH_SERVICE_OPTIONS) private authServiceOptions: IAuthServiceOptions,
    @Inject(OAUTH_FACTORY_SERIVCE) private readonly oauthFactoryService: IOAuthFactoryService,
  ) {}

  private toUserAuthDto(user: User | UserWithRoles): UserAuthDto {
    const userAuthDto = new UserAuthDto();
    userAuthDto.id = user.id;
    userAuthDto.username = user.username;
    if ('role' in user) {
      userAuthDto.permissions = user.role.rolesToPermissions.map(
        ({ permission }) => permission.name as RBAC.Permission,
      );
    }
    userAuthDto.sex = fromSexPersistance(user.sex);
    userAuthDto.description = user.description;

    return userAuthDto;
  }

  private parseAuthString(authString: AuthString): [AuthProvider, AuthToken] {
    const [authProvider, authToken = ''] = authString.split(' ');

    return [AuthProvider(authProvider), AuthToken(authToken)];
  }

  private getProviderUserInfo(
    authString: AuthString,
  ): Effect.Effect<ProviderId, UnknownProviderError | InvalidCredentialsError> {
    return pipe(
      Effect.Do,
      Effect.let('parsedAuth', () => this.parseAuthString(authString)),
      Effect.bind('providerService', ({ parsedAuth: [authProvider] }) => {
        return this.oauthFactoryService.getProviderService(authProvider);
      }),
      Effect.andThen(({ providerService, parsedAuth: [_, authToken] }) => {
        return providerService.getUserInfo(authToken);
      }),
    );
  }

  signInOauth(
    authString: AuthString,
  ): Effect.Effect<Option.Option<UserAuthDto>, UnauthorizedError | UnknownProviderError | InvalidCredentialsError> {
    if (!authString) {
      return Effect.fail(new UnauthorizedError());
    }

    return pipe(
      this.getProviderUserInfo(authString),
      Effect.andThen(this.authServiceOptions.getUserByProviderId),
      Effect.map(Option.map(this.toUserAuthDto)),
    );
  }

  signUpOauth(
    signUpDto: SignUpDto,
    authString: AuthString,
  ): Effect.Effect<UserAuthDto, UnauthorizedError | UnknownProviderError | InvalidCredentialsError> {
    if (!authString) {
      return Effect.fail(new UnauthorizedError());
    }

    return pipe(
      Effect.Do,
      Effect.let('authInfo', () => this.parseAuthString(authString)),
      Effect.bind('providerType', ({ authInfo: [authProvider] }) => {
        return this.oauthFactoryService.getProvider(authProvider);
      }),
      Effect.bind('providerService', ({ authInfo: [authProvider] }) =>
        this.oauthFactoryService.getProviderService(authProvider),
      ),
      Effect.bind('providerId', ({ providerService, authInfo: [_, authToken] }) =>
        providerService.getUserInfo(authToken),
      ),
      Effect.andThen(({ providerId, providerType }) =>
        this.authServiceOptions.createUserWithSocialCredentials({
          username: Username(signUpDto.username),
          providerId,
          providerType,
        }),
      ),
      Effect.map((user) => this.toUserAuthDto(user)),
    );
  }

  getAuthUser(userId: number): Effect.Effect<Option.Option<UserAuthDto>> {
    return pipe(this.authServiceOptions.getUserById(userId), Effect.map(Option.map(this.toUserAuthDto)));
  }
}
