import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Effect, Option, pipe } from 'effect';
import { PinoLogger } from 'nestjs-pino';

import { StorageBase } from '~/libs/adapters/storage.base';

import { SessionEntity } from '../domain/session.entity';
import { SESSIONS_STORAGE_NAME } from '../session.di-tokens';
import { SessionMapper } from '../session.mapper';
import { SessionStoragePort } from './session.storage.port';
import { SessionId } from '../domain/session.types';

const TWO_WEEKS_TTL = 14 * 24 * 60 * 60;

export type SessionModel = {
  sessionId: string;
  userId: number;
  ip: string;
  userAgent: string;
  createdAt: string;
  lastAccessAt: string;
};

@Injectable()
export class SessionStorage extends StorageBase<SessionEntity, SessionModel> implements SessionStoragePort {
  constructor(mapper: SessionMapper, eventEmitter: EventEmitter2) {
    super(SESSIONS_STORAGE_NAME, mapper, eventEmitter, new PinoLogger({ renameContext: SessionStorage.name }));
  }

  private getSessionKey(sessionId: SessionId): string {
    return `session:${sessionId}`;
  }

  saveSession(session: SessionEntity): Effect.Effect<void, Error> {
    return pipe(
      Effect.sync(() => this.getSessionKey(session.getProps().sessionId)),
      Effect.andThen((sessionKey) => this.setMap(sessionKey, session, TWO_WEEKS_TTL)),
    );
  }

  getSession(sessionId: SessionId): Effect.Effect<Option.Option<SessionEntity>, Error> {
    return pipe(
      Effect.sync(() => this.getSessionKey(sessionId)),
      Effect.flatMap((sessionKey) =>
        pipe(this.getMap(sessionKey), Effect.tap(Option.map(() => this.expire(sessionKey, TWO_WEEKS_TTL)))),
      ),
    );
  }
  deleteSession(sessionId: SessionId): Effect.Effect<void, Error> {
    return pipe(this.getSessionKey(sessionId), this.delete);
  }
}
