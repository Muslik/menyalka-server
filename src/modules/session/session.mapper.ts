import { Injectable } from '@nestjs/common';

import { Mapper } from '~/libs/ddd';

import { SessionEntity } from './domain/session.entity';
import { SessionId } from './session-service.port';
import { SessionModel } from './storage/session.storage';

@Injectable()
export class SessionMapper implements Mapper<SessionEntity, SessionModel> {
  toPersistence(entity: SessionEntity): SessionModel {
    const copy = entity.getProps();

    return {
      sessionId: copy.sessionId,
      userId: copy.userId,
      userAgent: copy.userAgent,
      ip: copy.ip,
      lastAccessAt: copy.lastAccessAt.toISOString(),
      createdAt: copy.createdAt.toISOString(),
    };
  }

  toDomain(record: SessionModel): SessionEntity {
    const entity = new SessionEntity({
      id: record.sessionId,
      createdAt: new Date(record.createdAt),
      props: {
        sessionId: SessionId(record.sessionId),
        userId: record.userId,
        userAgent: record.userAgent,
        ip: record.ip,
        lastAccessAt: new Date(record.lastAccessAt),
      },
    });

    return entity;
  }

  toResponse(): void {
    throw new Error('Method not implemented.');
  }
}
