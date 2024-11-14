import { Effect, Option } from 'effect';

import { SessionCreateDto } from './dto/session-create.dto';
import { Session, SessionId } from './session.entity';

export interface ISessionService {
  createSession(session: SessionCreateDto): Effect.Effect<Session>;
  getSession(sessionId: SessionId): Effect.Effect<Option.Option<Session>>;
  deleteSession(sessionId: SessionId): Effect.Effect<void>;
}
