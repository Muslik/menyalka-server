import { Brand, Effect, Option } from 'effect';

import { EmailAlreadyExistsError, UnauthorizedError, UnknownProviderError, UsernameAlreadyExistsError } from '../../auth.errors';
import { SignInTelegramDto } from '../../dto/signInTelegram.dto';
import { SignUpDto } from '../../dto/signUp.dto';
import { UserAuthDto } from '../../dto/userAuth.dto';

export type AuthString = string & Brand.Brand<'AuthString'>;
export const AuthString = Brand.nominal<AuthString>();

export type AuthProvider = string & Brand.Brand<'AuthProvider'>;
export const AuthProvider = Brand.nominal<AuthProvider>();

export type AuthData = string & Brand.Brand<'AuthData'>;
export const AuthData = Brand.nominal<AuthData>();

export interface IAuthService {
  signInOauth(authString: AuthString): Effect.Effect<Option.Option<UserAuthDto>, UnknownProviderError | UnauthorizedError | Error>;
  /* signUpOauth( */
  /*   signUpDto: SignUpDto, */
  /*   authString: AuthString, */
  /* ): Effect.Effect<UserActivation, EmailAlreadyExistsError | UsernameAlreadyExistsError | Error>; */
  getMe(userId: number): Effect.Effect<Option.Option<UserAuthDto>, Error>;
}
