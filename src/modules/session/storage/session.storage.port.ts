import { Effect, Option } from 'effect';

import { StoragePort } from '~/libs/ddd/storage.port';

import { SessionEntity } from '../domain/session.entity';
import { SessionId } from '../domain/session.types';

export interface SessionStoragePort extends StoragePort<SessionEntity> {
  saveSession(session: SessionEntity): Effect.Effect<void, Error>;
  getSession(sessionId: SessionId): Effect.Effect<Option.Option<SessionEntity>, Error>;
  deleteSession(sessionId: SessionId): Effect.Effect<void, Error>;
}
