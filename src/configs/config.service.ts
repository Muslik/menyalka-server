import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

import { ConfigPort } from './config.port';

export const NODE_ENV = process.env.NODE_ENV ?? 'development';

export const config = (): ConfigPort => {
  return {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '', 10) || 4000,
    isProduction: NODE_ENV === 'production',
    isDevelopment: NODE_ENV === 'development',
    isTest: NODE_ENV === 'test',
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    },
    database: {
      url: process.env.DATABASE_URL || '',
    },
    redis: {
      url: process.env.REDIS_URL || '',
      sessionDatabase: '1',
      cacheDatabase: '2',
    },
  };
};

@Injectable()
export class ConfigService implements ConfigPort {
  constructor(public nestConfigService: NestConfigService<ConfigPort, true>) { }

  get host(): ConfigPort['host'] {
    return this.nestConfigService.get('host');
  }

  get port(): ConfigPort['port'] {
    return this.nestConfigService.get('port');
  }

  get isProduction(): ConfigPort['isProduction'] {
    return this.nestConfigService.get('isProduction');
  }

  get isDevelopment(): ConfigPort['isDevelopment'] {
    return this.nestConfigService.get('isDevelopment');
  }

  get isTest(): ConfigPort['isTest'] {
    return this.nestConfigService.get('isTest');
  }

  get database(): ConfigPort['database'] {
    return this.nestConfigService.get('database');
  }

  get redis(): ConfigPort['redis'] {
    return this.nestConfigService.get('redis');
  }

  get telegram(): ConfigPort['telegram'] {
    return this.nestConfigService.get('telegram');
  }
}
