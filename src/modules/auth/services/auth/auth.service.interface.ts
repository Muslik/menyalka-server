import { Brand, Effect, Option } from 'effect';

import { InvalidCredentialsError, UnauthorizedError, UnknownProviderError } from '../../auth.errors';
import { SignUpDto } from '../../dto/signUp.dto';
import { UserAuthDto } from '../../dto/userAuth.dto';

export type AuthString = string & Brand.Brand<'AuthString'>;
export const AuthString = Brand.nominal<AuthString>();

export type AuthProvider = string & Brand.Brand<'AuthProvider'>;
export const AuthProvider = Brand.nominal<AuthProvider>();

export type AuthToken = string & Brand.Brand<'AuthToken'>;
export const AuthToken = Brand.nominal<AuthToken>();

export interface IAuthService {
  signInOauth(
    authString: AuthString,
  ): Effect.Effect<Option.Option<UserAuthDto>, UnknownProviderError | InvalidCredentialsError | UnauthorizedError>;
  signUpOauth(
    signUpDto: SignUpDto,
    authString: AuthString,
  ): Effect.Effect<UserAuthDto, UnknownProviderError | InvalidCredentialsError | UnauthorizedError>;
  getAuthUser(userId: number): Effect.Effect<Option.Option<UserAuthDto>>;
}
