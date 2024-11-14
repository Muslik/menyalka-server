import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cause, Effect, Exit, Option, pipe } from 'effect';

import { SESSION_ID } from '~/config/config.constants';
import { UserWithRoles } from '~/libs/database';
import { IS_PUBLIC_KEY } from '~/libs/decorators';
import { REQUEST_USER } from '~/libs/decorators';
import { ISessionService, SESSION_SERVICE, SessionId } from '~/modules/session';
import { IUserService, USER_SERVICE } from '~/modules/user';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    protected reflector: Reflector,
    @Inject(USER_SERVICE) protected readonly userService: IUserService,
    @Inject(SESSION_SERVICE) protected readonly sessionService: ISessionService,
  ) {}

  private getUserFromSessionId(sessionId: SessionId): Effect.Effect<Option.Option<UserWithRoles>> {
    if (!sessionId) {
      return Effect.succeed(Option.none());
    }

    return pipe(
      this.sessionService.getSession(sessionId),
      Effect.flatMap(
        Option.match({
          onSome: (session) => this.userService.getUserWithRolesById(session.userId),
          onNone: () => Effect.succeed(Option.none()),
        }),
      ),
    );
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // Add UserIdentity validation
    const cookieSessionId = Option.fromNullable<SessionId>(request.cookies[SESSION_ID]);

    const result = await Effect.runPromiseExit(
      pipe(
        Effect.sync(() => cookieSessionId),
        Effect.flatMap(
          Option.match({
            onSome: (sessionId) => this.getUserFromSessionId(sessionId),
            onNone: () => Effect.fail(new UnauthorizedException()),
          }),
        ),
        Effect.flatMap(
          Option.match({
            onSome: (user) => {
              request[REQUEST_USER] = user;

              return Effect.succeed(true);
            },
            onNone: () => Effect.fail(new UnauthorizedException()),
          }),
        ),
      ),
    );

    if (Exit.isExit(result)) {
      return Exit.match(result, {
        onSuccess: (result) => result,
        onFailure: (cause) => {
          const error = Cause.squash(cause);
          throw error;
        },
      });
    }

    return false;
  }
}
