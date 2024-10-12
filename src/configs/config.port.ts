export interface ConfigPort {
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
}