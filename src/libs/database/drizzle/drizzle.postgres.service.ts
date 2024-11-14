import { Injectable } from '@nestjs/common';
import { DrizzleConfig } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { PinoLogger } from 'nestjs-pino';
import postgres from 'postgres';
import type { Options, PostgresType } from 'postgres';

import * as schema from './schema';

export interface DrizzlePostgresConfig {
  postgres: {
    url: string;
    config?: Options<Record<string, PostgresType<any>>> | undefined;
  };
  config?: DrizzleConfig<any> | undefined;
}

@Injectable()
export class DrizzlePostgresService {
  constructor(private readonly logger: PinoLogger) {}
  getDrizzle(options: DrizzlePostgresConfig) {
    const client = postgres(options.postgres.url, options.postgres.config);

    client`SELECT NOW() as current_time`
      .then(() => {
        this.logger.debug(`Connected to the database ${options.postgres.url}`);
      })
      .catch((error) => {
        this.logger.error('Unable to connect to the database', error);
        throw error;
      });

    return drizzle(client, {
      ...options.config,
      schema: { ...schema },
    });
  }
}
