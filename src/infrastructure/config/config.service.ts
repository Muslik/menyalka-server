import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

import { Config, IConfigService } from './config.service.interface';

export const NODE_ENV = process.env.NODE_ENV ?? 'development';

export const config = (): Config => {
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
export class ConfigService implements IConfigService {
  constructor(public nestConfigService: NestConfigService<Config, true>) { }

  get host(): Config['host'] {
    return this.nestConfigService.get('host');
  }

  get port(): Config['port'] {
    return this.nestConfigService.get('port');
  }

  get isProduction(): Config['isProduction'] {
    return this.nestConfigService.get('isProduction');
  }

  get isDevelopment(): Config['isDevelopment'] {
    return this.nestConfigService.get('isDevelopment');
  }

  get isTest(): Config['isTest'] {
    return this.nestConfigService.get('isTest');
  }

  get database(): Config['database'] {
    return this.nestConfigService.get('database');
  }

  get redis(): Config['redis'] {
    return this.nestConfigService.get('redis');
  }

  get telegram(): Config['telegram'] {
    return this.nestConfigService.get('telegram');
  }
}
