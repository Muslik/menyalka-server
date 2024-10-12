import * as crypto from 'crypto';

import { AggregateID, AggregateRoot } from '~/libs/ddd';

import { SessionCreatedDomainEvent } from './events/session-created.domain-event';
import { CreateSessionProps, SessionId, SessionProps } from './session.types';

export class SessionEntity extends AggregateRoot<SessionProps> {
  protected readonly _id: AggregateID;

  static generateSessionId(): string {
    return crypto.createHash('sha256').update(crypto.randomUUID()).update(crypto.randomBytes(256)).digest('hex');
  }

  static create(create: CreateSessionProps): SessionEntity {
    const sessionId = SessionId(this.generateSessionId());

    const props: SessionProps = {
      sessionId,
      userId: create.userId,
      userAgent: create.userAgent,
      ip: create.ip,
      lastAccessAt: new Date(),
    };

    const session = new SessionEntity({ id: sessionId, props });
    session.addEvent(
      new SessionCreatedDomainEvent({
        aggregateId: sessionId,
        ip: props.ip,
        userAgent: props.userAgent,
        userId: props.userId,
        sessionId: props.sessionId,
        lastAccessDate: props.lastAccessAt,
      }),
    );

    return session;
  }

  validate(): void {}
}
