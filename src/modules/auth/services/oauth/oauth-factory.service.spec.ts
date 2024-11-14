import { it } from '@effect/vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { Effect, Exit } from 'effect';

import { TELEGRAM_OAUTH_SERVICE } from '../../auth.constants';
import { UnknownProviderError } from '../../auth.errors';
import { AuthProvider } from '../auth/auth.service.interface';
import { Provider } from '../oauth/oauth-factory.service.interface';
import { OAuthFactoryService } from './oauth-factory.service';

const telegramOauthServiceMock = {};

describe('Outh factory service', () => {
  let oauthFactoryService: OAuthFactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthFactoryService,
        {
          provide: TELEGRAM_OAUTH_SERVICE,
          useValue: telegramOauthServiceMock,
        },
      ],
    }).compile();

    oauthFactoryService = module.get<OAuthFactoryService>(OAuthFactoryService);
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  describe('getProvider', () => {
    it.effect('Should return error on unknown provider', () =>
      Effect.gen(function* () {
        const result = yield* Effect.exit(oauthFactoryService.getProvider(AuthProvider('unknown')));

        expect(result).toStrictEqual(Exit.fail(new UnknownProviderError()));
      }),
    );
    it.effect('Should return telegram on correct provider', () =>
      Effect.gen(function* () {
        const result = yield* Effect.exit(oauthFactoryService.getProvider(AuthProvider('tma')));

        expect(result).toStrictEqual(Exit.succeed(Provider.telegram));
      }),
    );
  });

  describe('getProviderService', () => {
    it.effect('Should return error on unknown provider', () =>
      Effect.gen(function* () {
        const result = yield* Effect.exit(oauthFactoryService.getProviderService(AuthProvider('unknown')));

        expect(result).toStrictEqual(Exit.fail(new UnknownProviderError()));
      }),
    );
    it.effect('Should return telegram service on correct provider', () =>
      Effect.gen(function* () {
        const result = yield* Effect.exit(oauthFactoryService.getProviderService(AuthProvider('tma')));

        expect(result).toStrictEqual(Exit.succeed(telegramOauthServiceMock));
      }),
    );
  });
});
