import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Config } from './config';
import { IConfigService } from './config.service.interface';

@Injectable()
export class AppConfigService implements IConfigService {
  constructor(private configService: ConfigService<Config, true>) {}

  get port(): Config['port'] {
    return this.configService.get('port');
  }

  get isProduction(): Config['isProduction'] {
    return this.configService.get('isProduction');
  }

  get isDevelopment(): Config['isDevelopment'] {
    return this.configService.get('isDevelopment');
  }

  get isTest(): Config['isTest'] {
    return this.configService.get('isTest');
  }

  get database(): Config['database'] {
    return this.configService.get('database');
  }

  get redis(): Config['redis'] {
    return this.configService.get('redis');
  }

  get telegram(): Config['telegram'] {
    return this.configService.get('telegram');
  }
}
