import { Brand, Effect, Option } from 'effect';
import { Session } from './session.entity';
import { SessionCreateDto } from './dto/session-create.dto';

export type SessionId = string & Brand.Brand<'SessionId'>;
export const SessionId = Brand.nominal<SessionId>();

export interface ISessionService {
  createSession(session: SessionCreateDto): Effect.Effect<Session, Error>;
  getSession(sessionId: SessionId): Effect.Effect<Option.Option<Session>, Error>;
  deleteSession(sessionId: SessionId): Effect.Effect<void, Error>;
}
