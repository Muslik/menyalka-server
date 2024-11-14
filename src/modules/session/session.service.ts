import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Effect, Option, pipe } from 'effect';

import { UserId } from '~/libs/database';
import { STORAGE_SERVICE, StorageService } from '~/libs/storage';

import { SessionCreateDto } from './dto/session-create.dto';
import { Session, SessionId } from './session.entity';
import { ISessionService } from './session.service.interface';

const TWO_WEEKS_TTL = 14 * 24 * 60 * 60;
const MAX_SESSIONS_PER_USER = 3;
const SESSION_KEY = 'session';
const SESSION_MAP = 'session-map';
const SESSION_SET = 'session-set';

@Injectable()
export class SessionService implements ISessionService {
  constructor(@Inject(STORAGE_SERVICE) private readonly storageService: StorageService) {}

  private getSessionKey(sessionId: SessionId): string {
    return `${SESSION_KEY}:${sessionId}`;
  }

  private getSessionUserKey(userId: UserId): string {
    return `${SESSION_SET}:${userId}`;
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
    return new Session({
      sessionId: SessionId(data.sessionId),
      userAgent: data.userAgent,
      ip: data.ip,
      createdAt: new Date(data.createdAt),
      lastAccessAt: new Date(data.lastAccessAt),
      userId: UserId(parseInt(data.userId, 10)),
    });
  }

  createSession(sessionCreateDto: SessionCreateDto): Effect.Effect<Session> {
    return pipe(
      Effect.Do,
      Effect.let(
        'addSessionScript',
        () => `
  local sessionUserKey = KEYS[1]
  local sessionKey = KEYS[2]
  local sessionMapName = KEYS[3]
  local sessionId = ARGV[1]
  local sessionData = ARGV[2]
  local ttl = tonumber(ARGV[3])
  local maxSessions = tonumber(ARGV[4])

  local timestamp = redis.call('TIME')[1]
  redis.call('ZADD', sessionUserKey, timestamp, sessionId)
  redis.call('HSET', sessionMapName, sessionKey, sessionData)
  redis.call('EXPIRE', sessionKey, ttl)

  local sessionCount = redis.call('ZCARD', sessionUserKey)
  if sessionCount > maxSessions then
    local oldestSessionId = redis.call('ZRANGE', sessionUserKey, 0, 0)[1]
    if oldestSessionId then
      redis.call('ZREM', sessionUserKey, oldestSessionId)
      redis.call('HDEL', sessionMapName, 'session:' .. oldestSessionId)
    end
  end
`,
      ),
      Effect.let('session', () => {
        return new Session({
          sessionId: SessionId(this.generateSessionId()),
          userAgent: sessionCreateDto.userAgent,
          ip: sessionCreateDto.ip,
          createdAt: new Date(),
          lastAccessAt: new Date(),
          userId: sessionCreateDto.userId,
        });
      }),
      Effect.let('sessionKey', ({ session }) => this.getSessionKey(session.sessionId)),
      Effect.let('sessionUserKey', ({ session }) => this.getSessionUserKey(session.userId)),
      Effect.tap(({ addSessionScript, session, sessionUserKey, sessionKey }) => {
        return Effect.promise(() => {
          return this.storageService.eval(
            addSessionScript,
            3,
            sessionUserKey,
            sessionKey,
            SESSION_MAP,
            session.sessionId,
            JSON.stringify(this.stringifySession(session)),
            TWO_WEEKS_TTL,
            MAX_SESSIONS_PER_USER,
          );
        });
      }),
      Effect.map(({ session }) => session),
    );
  }

  getSession(sessionId: SessionId): Effect.Effect<Option.Option<Session>> {
    return pipe(
      Effect.Do,
      Effect.let('sessionKey', () => this.getSessionKey(sessionId)),
      Effect.bind('sessionMap', ({ sessionKey }) => this.storageService.getMap(SESSION_MAP, sessionKey)),
      Effect.tap(({ sessionKey, sessionMap }) =>
        Option.isSome(sessionMap) ? this.storageService.expire(sessionKey, TWO_WEEKS_TTL) : Effect.void,
      ),
      Effect.map(({ sessionMap }) => Option.map(sessionMap, this.parseSession)),
    );
  }

  deleteSession(sessionId: SessionId): Effect.Effect<void> {
    return pipe(
      Effect.Do,
      Effect.let(
        'removeSessionScript',
        () => `
local sessionMapName = KEYS[1]
local sessionUserKeyPattern = KEYS[2]
local sessionKey = ARGV[1]

local sessionData = redis.call('HGET', sessionMapName, sessionKey)
if not sessionData then
  return nil
end

local sessionInfo = cjson.decode(sessionData)
local userId = sessionInfo.userId
if not userId then
  return nil
end

local sessionUserKey = string.gsub(sessionUserKeyPattern, "<userId>", userId)

redis.call('ZREM', sessionUserKey, sessionKey)

redis.call('HDEL', sessionMapName, sessionKey)

return true
`,
      ),
      Effect.let('sessionKey', () => this.getSessionKey(sessionId)),
      Effect.tap(({ removeSessionScript, sessionKey }) =>
        Effect.promise(() =>
          this.storageService.eval(removeSessionScript, 2, SESSION_MAP, `${SESSION_SET}:<userId>`, sessionKey),
        ),
      ),
      Effect.asVoid,
    );
  }
}
