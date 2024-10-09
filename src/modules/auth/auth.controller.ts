import { Controller, Inject, Post, Res } from '@nestjs/common';
import {  ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { pipe, Effect, Option } from 'effect';
import { FastifyReply } from 'fastify';

import { CONFIG_SERVICE, IConfigService } from '~/infrastructure/config';
import { Header, SESSION_ID, UserIdentity } from '~/infrastructure/decorators';
import { SessionId } from '~/modules/session';

import { AUTH_SERVICE, AUTH_SERVICE_OPTIONS } from './auth.constants';
import { SignInResponseDto, SignInStatus } from './dto/signInResponse.dto';
import { IAuthServiceOptions } from './interfaces/authServiceOptions.interface';
import { AuthString, IAuthService } from './services/auth/auth.service.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
    @Inject(AUTH_SERVICE_OPTIONS) private readonly authServiceOptions: IAuthServiceOptions,
    @Inject(CONFIG_SERVICE) private readonly configService: IConfigService,
  ) { }

  private setSessionCookie(response: FastifyReply, sessionId: SessionId): void {
    response.setCookie(SESSION_ID, sessionId, {
      httpOnly: true,
      path: '/',
      secure: true,
      sameSite: this.configService.isDevelopment ? 'none' : 'lax',
    });
  }

  @ApiOperation({ summary: 'oauth signin' })
  @ApiCreatedResponse({ description: 'Sign in status', type: SignInResponseDto })
  @Post('oauth/sign-in')
  ouauthSignIn(
    @Res({ passthrough: true }) response: FastifyReply,
    @UserIdentity() userIdentity: UserIdentity,
    @Header('Authorization') authorization: AuthString,
  ): Effect.Effect<SignInResponseDto, Error> {
    return pipe(
      this.authService.signInOauth(authorization),
      Effect.andThen(
        Option.map((user) =>
          this.authServiceOptions.createSession({
            ip: userIdentity.ip,
            userId: user.id,
            userAgent: userIdentity.userAgent,
          }),
        ),
      ),
      Effect.tap(Option.map(({ sessionId }) => this.setSessionCookie(response, sessionId))),
      Effect.map(
        Option.match({
          onSome: () => ({ status: SignInStatus.success }),
          onNone: () => ({ status: SignInStatus.needSignUp }),
        }),
      ),
    );
  }

  /* @ApiOperation({ summary: 'oauth signup' }) */
  /* @Post('oauth/sign-up') */
  /* async ouauthSignUp(@Param('userId', ParseIntPipe) userId: B.UserId, @Body() { roleId }: AssignRoleToUserDto) {} */
}
