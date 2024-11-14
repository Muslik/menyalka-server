export type Config = {
  port: number;
  host: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  telegram: {
    botToken: string;
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
    sessionDatabase: string;
    cacheDatabase?: string;
  };
};

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
