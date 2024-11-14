import { Config } from './config';

export interface IConfigService {
  port: number;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  database: Config['database'];
  redis: Config['redis'];
  telegram: Config['telegram'];
}
