import { Brand } from "effect";

export type SessionId = string & Brand.Brand<'SessionId'>;
export const SessionId = Brand.nominal<SessionId>();

export interface SessionProps {
  sessionId: SessionId;
  userAgent: string;
  ip: string;
  lastAccessAt: Date;
  userId: number;
}

export interface CreateSessionProps {
  userAgent: string;
  ip: string;
  userId: number;
}
