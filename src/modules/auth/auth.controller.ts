import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiHeader,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  refs,
} from '@nestjs/swagger';
import { pipe, Effect, Option } from 'effect';
import { FastifyReply } from 'fastify';

import { AppConfigService, CONFIG_SERVICE } from '~/config';
import { SESSION_ID } from '~/config/config.constants';
import { Username, UserWithRoles } from '~/libs/database';
import { ApiAuth, Cookies, Header, Public, RequestUser, UserIdentity } from '~/libs/decorators';
import { UnauthorizedException } from '~/libs/exceptions';
import { SessionId } from '~/modules/session';

import { AUTH_SERVICE, AUTH_SERVICE_OPTIONS } from './auth.constants';
import { UnauthorizedError, UsernameAlreadyExistsError } from './auth.errors';
import { SignInResponseDto, SignInStatus } from './dto/signInResponse.dto';
import { SignUpDto, SignUpDtoValidationResponse } from './dto/signUp.dto';
import { UserAuthDto } from './dto/userAuth.dto';
import { IAuthServiceOptions } from './interfaces/authServiceOptions.interface';
import { AuthString, IAuthService } from './services/auth/auth.service.interface';

const AUTH_HEADER = 'authorization';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
    @Inject(AUTH_SERVICE_OPTIONS) private readonly authServiceOptions: IAuthServiceOptions,
    @Inject(CONFIG_SERVICE) private readonly configService: AppConfigService,
  ) {}

  private setSessionCookie(response: FastifyReply, sessionId: SessionId): void {
    response.setCookie(SESSION_ID, sessionId, {
      httpOnly: true,
      path: '/',
      secure: !this.configService.isDevelopment,
      sameSite: this.configService.isDevelopment ? 'lax' : 'none',
      maxAge: COOKIE_MAX_AGE,
    });
  }

  private clearSessionCookie(response: FastifyReply): void {
    response.clearCookie(SESSION_ID);
  }

  @Public()
  @ApiOperation({ summary: 'oauth signin' })
  @ApiCreatedResponse({ description: 'Sign in status', type: SignInResponseDto })
  @ApiHeader({
    name: AUTH_HEADER,
    description: 'Oauth token',
    required: true,
  })
  @Post('oauth/sign-in')
  oauthSignIn(
    @Res({ passthrough: true }) response: FastifyReply,
    @UserIdentity() userIdentity: UserIdentity,
    @Header(AUTH_HEADER) authorization: AuthString = AuthString(''),
  ) {
    return Effect.runPromiseExit(
      pipe(
        this.authService.signInOauth(authorization),
        Effect.flatMap(
          Option.match({
            onSome: (user) =>
              pipe(
                this.authServiceOptions.createSession({
                  ip: userIdentity.ip,
                  userId: user.id,
                  userAgent: userIdentity.userAgent,
                }),
                Effect.tap(({ sessionId }) => this.setSessionCookie(response, sessionId)),
                Effect.map(() => ({ status: SignInStatus.success })),
              ),
            onNone: () => Effect.succeed({ status: SignInStatus.needSignUp }),
          }),
        ),
      ),
    );
  }

  @Public()
  @ApiOperation({ summary: 'oauth signup' })
  @ApiCreatedResponse({ description: 'Sign up success' })
  @ApiHeader({
    name: AUTH_HEADER,
    description: 'Oauth token',
    required: true,
  })
  @ApiExtraModels(SignUpDtoValidationResponse, UsernameAlreadyExistsError)
  @ApiBadRequestResponse({
    description: 'Validation error',
    schema: { anyOf: refs(SignUpDtoValidationResponse, UsernameAlreadyExistsError) },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: UnauthorizedException,
  })
  @Post('oauth/sign-up')
  async oauthSignUp(
    @Res({ passthrough: true }) response: FastifyReply,
    @UserIdentity() userIdentity: UserIdentity,
    @Body() signUpDto: SignUpDto,
    @Header(AUTH_HEADER) authorization: AuthString = AuthString(''),
  ) {
    return Effect.runPromiseExit(
      pipe(
        this.authServiceOptions.getUserByUsername(Username(signUpDto.username)),
        Effect.andThen(
          Option.match({
            onSome: () => Effect.fail(new UsernameAlreadyExistsError()),
            onNone: () => this.authService.signUpOauth(signUpDto, authorization),
          }),
        ),
        Effect.andThen((user) =>
          this.authServiceOptions.createSession({
            ip: userIdentity.ip,
            userId: user.id,
            userAgent: userIdentity.userAgent,
          }),
        ),
        Effect.tap(({ sessionId }) => this.setSessionCookie(response, sessionId)),
      ),
    );
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Read session token and return session user data' })
  @ApiCreatedResponse({ description: 'Session exist', type: UserAuthDto })
  @ApiUnauthorizedResponse({
    description: 'User not authorized',
    type: UnauthorizedException,
  })
  @Post('me')
  async me(@RequestUser() user: UserWithRoles) {
    return Effect.runPromiseExit(
      pipe(
        this.authService.getAuthUser(user.id),
        Effect.andThen(
          Option.match({
            onSome: Effect.succeed,
            onNone: () => Effect.fail(new UnauthorizedError()),
          }),
        ),
      ),
    );
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Delete current session' })
  @ApiCreatedResponse({ description: 'Session deleted' })
  @Post('logout')
  logout(@Res({ passthrough: true }) response: FastifyReply, @Cookies() { sessionId }: Record<string, string>) {
    return Effect.runPromiseExit(
      pipe(
        this.authServiceOptions.deleteSession(sessionId),
        Effect.tap(() => this.clearSessionCookie(response)),
      ),
    );
  }
}
