import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

export const NODE_ENV = process.env.NODE_ENV ?? 'development';

export type Config = {
  port: number;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  database: {
    url: string;
  };
  redis: {
    host: string;
    port: number;
  };
};

export const config = (): Config => {
  return {
    port: parseInt(process.env.PORT || '', 10) || 3000,
    isProduction: NODE_ENV === 'production',
    isDevelopment: NODE_ENV === 'development',
    isTest: NODE_ENV === 'test',
    database: {
      url: process.env.DATABASE_URL || '',
    },
    redis: {
      host: process.env.REDIS_HOST || '',
      port: parseInt(process.env.REDIS_PORT || '', 10),
    },
  };
};

@Injectable()
export class ConfigService {
  constructor(public nestConfigService: NestConfigService<Config, true>) {}

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
}
