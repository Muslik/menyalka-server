import { Brand } from 'effect';

import { UserId } from '~/libs/database';

export type SessionId = string & Brand.Brand<'SessionId'>;
export const SessionId = Brand.nominal<SessionId>();

export class Session {
  sessionId: SessionId;
  userAgent: string;
  ip: string;
  createdAt: Date;
  lastAccessAt: Date;
  userId: UserId;

  constructor(props: {
    sessionId: SessionId;
    userAgent: string;
    ip: string;
    createdAt: Date;
    lastAccessAt: Date;
    userId: UserId;
  }) {
    this.sessionId = props.sessionId;
    this.userAgent = props.userAgent;
    this.ip = props.ip;
    this.createdAt = props.createdAt;
    this.lastAccessAt = props.lastAccessAt;
    this.userId = props.userId;
  }
}
