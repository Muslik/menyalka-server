import { it, Mock } from '@effect/vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { parse, validate } from '@telegram-apps/init-data-node';
import { Effect, Exit } from 'effect';

import { CONFIG_SERVICE, ConfigModule, IConfigService } from '~/infrastructure/config';

import { TelegramAuthService } from './telegram-auth.service';

vitest.mock('@telegram-apps/init-data-node', () => ({
  validate: vitest.fn(),
  parse: vitest.fn(),
}));

const configMock: Partial<IConfigService> = {
  telegram: {
    botToken: 'someToken',
  },
};

describe('Telegram auth service', () => {
  let telegramAuthService: TelegramAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: CONFIG_SERVICE,
          useValue: configMock,
        },
        TelegramAuthService,
      ],
    }).compile();

    telegramAuthService = module.get<TelegramAuthService>(TelegramAuthService);
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  describe('Validate auth data', () => {
    it.effect('Should return user data on success autha ata validation', () =>
      Effect.gen(function* () {
        (validate as Mock).mockImplementationOnce(() => ({ userName: 'superuser' }));
        (parse as Mock).mockImplementationOnce(() => ({ userName: 'superuser' }));
        const result = yield* telegramAuthService.validateAuthData('authData').pipe(Effect.exit);

        expect(validate).toHaveBeenCalledWith('authData', configMock.telegram?.botToken);
        expect(result).toStrictEqual(Exit.succeed({ userName: 'superuser' }));
      }),
    );

    it.effect('Should return an error on failed auth data validation', () =>
      Effect.gen(function* () {
        (validate as Mock).mockImplementationOnce(() => {
          throw 'Invalid auth data';
        });

        const result = yield* telegramAuthService.validateAuthData('authData').pipe(Effect.exit);
        expect(Exit.isFailure(result)).toBe(true);
      }),
    );
  });
});
