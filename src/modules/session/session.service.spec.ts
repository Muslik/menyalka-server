import { it } from '@effect/vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { Effect, Exit, Option } from 'effect';

import { UserId } from '~/libs/database';
import { STORAGE_SERVICE } from '~/libs/storage';

import { SessionId, Session } from './session.entity';
import { SessionService } from './session.service';

const storageServiceMock = {
  eval: () => Promise.resolve(),
  getMap: vitest.fn(),
  expire: vitest.fn(),
};

describe('SessionService', () => {
  let sessionService: SessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: STORAGE_SERVICE,
          useValue: storageServiceMock,
        },
        SessionService,
      ],
    }).compile();

    sessionService = module.get<SessionService>(SessionService);
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  it.effect('Creating session', () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        sessionService.createSession({ userId: UserId(1), ip: '127.0.0.1', userAgent: 'userAgent' }),
      );

      expect(result).toStrictEqual(
        Exit.succeed(
          new Session({
            userId: UserId(1),
            createdAt: expect.any(Date),
            lastAccessAt: expect.any(Date),
            ip: '127.0.0.1',
            userAgent: 'userAgent',
            sessionId: expect.any(String),
          }),
        ),
      );
    }),
  );

  it.effect('Returns session if it exists', () =>
    Effect.gen(function* () {
      const session = {
        sessionId: '123',
        userAgent: 'userAgent',
        ip: '127.0.0.1',
        createdAt: new Date().toISOString(),
        lastAccessAt: new Date().toISOString(),
        userId: UserId(1).toString(),
      };

      storageServiceMock.getMap.mockReturnValueOnce(Effect.succeed(Option.some(session)));
      const result = yield* Effect.exit(sessionService.getSession(SessionId('123')));

      expect(result).toStrictEqual(
        Exit.succeed(
          Option.some(
            new Session({
              userId: UserId(1),
              createdAt: expect.any(Date),
              lastAccessAt: expect.any(Date),
              ip: '127.0.0.1',
              userAgent: 'userAgent',
              sessionId: expect.any(String),
            }),
          ),
        ),
      );
    }),
  );
});
