import { Inject, Injectable } from '@nestjs/common';
import { Option, Effect, pipe } from 'effect';

import { RBAC } from '~/infrastructure/config';
import { UserWithRoles } from '~/infrastructure/database';
import { ProviderUserId } from '~/infrastructure/database/drizzle/brands';

import { AUTH_SERVICE_OPTIONS } from '../../auth.constants';
import {
  EmailAlreadyExistsError,
  UnauthorizedError,
  UnknownProviderError,
  UsernameAlreadyExistsError,
} from '../../auth.errors';
import { SignUpDto } from '../../dto/signUp.dto';
import { UserAuthDto } from '../../dto/userAuth.dto';
import { IAuthServiceOptions } from '../../interfaces/authServiceOptions.interface';
import { OAuthFactoryService } from '../oauth/oauth-factory.service';
import { AuthData, AuthProvider, AuthString, IAuthService } from './auth.service.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(AUTH_SERVICE_OPTIONS) private authServiceOptions: IAuthServiceOptions,
    private readonly oauthFactoryService: OAuthFactoryService,
  ) { }

  private toUserAuthDto(user: UserWithRoles): UserAuthDto {
    const userAuthDto = new UserAuthDto();
    userAuthDto.id = user.id;
    userAuthDto.username = user.username;
    userAuthDto.permissions = user.role.rolesToPermissions.map(({ permission }) => permission.name as RBAC.Permission);
    userAuthDto.sex = user.sex;
    userAuthDto.description = user.description;
    userAuthDto.email = user.email;

    return userAuthDto;
  }

  private parseAuthString(authString: AuthString): [AuthProvider, AuthData] {
    const [authType, authData = ''] = authString.split(' ');

    return [AuthProvider(authType), AuthData(authData)];
  }

  private getProviderUserInfo(
    authString: AuthString,
  ): Effect.Effect<ProviderUserId, UnknownProviderError | UnauthorizedError | Error> {
    const [authType, authData] = this.parseAuthString(authString);

    return pipe(
      this.oauthFactoryService.getProvider(authType),
      Effect.andThen((provider) => provider.getUserInfo(authData)),
    );
  }

  signInOauth(
    authString: AuthString,
  ): Effect.Effect<Option.Option<UserAuthDto>, UnknownProviderError | UnauthorizedError | Error> {
    return pipe(
      this.getProviderUserInfo(authString),
      Effect.andThen((providerUserId) => this.authServiceOptions.getUserByProviderId(providerUserId)),
      Effect.map(Option.map(this.toUserAuthDto)),
    );
  }

  /* signUpOauth( */
  /*   signUpDto: SignUpDto, */
  /*   authString: AuthString, */
  /* ): Effect.Effect<UserActivation, EmailAlreadyExistsError | UsernameAlreadyExistsError | Error> { */
  /*   // Чекаем авториацию */
  /*   // Проверяем email на уникальность -> BadRequest User with this email already exists */
  /*   // Проверяем username на уникальность -> BadRequest User with this username already exists */
  /*   // Создаем пользователя */
  /*   // Создаеь social credentials */
  /*   // Отдаем пользователя */
  /*   return pipe(); */
  /* } */

  getMe(userId: number): Effect.Effect<Option.Option<UserAuthDto>, Error> {
    return pipe(this.authServiceOptions.getUserById(userId), Effect.map(Option.map(this.toUserAuthDto)));
  }
}
