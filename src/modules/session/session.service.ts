import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Effect, Option, pipe } from 'effect';

import { StorageService } from '~/infrastructure/storage/storage.service.abstract';
import { STORAGE_SERVICE } from '~/infrastructure/storage/storage.service.constants';

import { SessionCreateDto } from './dto/session-create.dto';
import { Session } from './session.entity';
import { ISessionService, SessionId } from './session.service.interface';

const TWO_WEEKS_TTL = 14 * 24 * 60 * 60;

@Injectable()
export class SessionService implements ISessionService {
  constructor(@Inject(STORAGE_SERVICE) private readonly storageService: StorageService) {}

  private getSessionKey(sessionId: SessionId): string {
    return `session:${sessionId}`;
  }

  private generateSessionId = () => {
    return crypto.createHash('sha256').update(crypto.randomUUID()).update(crypto.randomBytes(256)).digest('hex');
  };

  private stringifySession(session: Session): Record<string, string> {
    return {
      sessionId: session.sessionId,
      userAgent: session.userAgent,
      ip: session.ip,
      createdAt: session.createdAt.toISOString(),
      lastAccessAt: session.lastAccessAt.toISOString(),
      userId: session.userId.toString(),
    };
  }

  private parseSession(data: Record<string, string>): Session {
    return {
      sessionId: SessionId(data.sessionId),
      userAgent: data.userAgent,
      ip: data.ip,
      createdAt: new Date(data.createdAt),
      lastAccessAt: new Date(data.lastAccessAt),
      userId: parseInt(data.userId, 10),
    };
  }

  createSession(sessionCreateDto: SessionCreateDto): Effect.Effect<Session, Error> {
    return pipe(
      Effect.sync(() => {
        const session = new Session();
        const sessionId = SessionId(this.generateSessionId());
        const sessionKey = this.getSessionKey(sessionId);

        session.sessionId = sessionId;
        session.userAgent = sessionCreateDto.userAgent;
        session.ip = sessionCreateDto.ip;
        session.createdAt = new Date();
        session.lastAccessAt = new Date();
        session.userId = sessionCreateDto.userId;

        return { session, sessionKey };
      }),
      Effect.tap(({ session, sessionKey }) =>
        this.storageService.setMap(sessionKey, this.stringifySession(session), TWO_WEEKS_TTL),
      ),
      Effect.map(({ session }) => session),
    );
  }

  getSession(sessionId: SessionId): Effect.Effect<Option.Option<Session>, Error> {
    return pipe(
      Effect.sync(() => this.getSessionKey(sessionId)),
      Effect.flatMap((sessionKey) =>
        pipe(
          this.storageService.getMap(sessionKey),
          Effect.tap(Option.map(() => this.storageService.expire(sessionKey, TWO_WEEKS_TTL))),
          Effect.map(Option.map(this.parseSession)),
        ),
      ),
    );
  }

  deleteSession(sessionId: SessionId): Effect.Effect<void, Error> {
    return pipe(this.getSessionKey(sessionId), this.storageService.delete);
  }
}
