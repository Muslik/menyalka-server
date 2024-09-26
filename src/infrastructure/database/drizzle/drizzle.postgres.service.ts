import { Injectable, Logger } from '@nestjs/common';
import { DrizzleConfig } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';
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
  private readonly logger: Logger = new Logger('Database Setup');

  async getDrizzle(options: DrizzlePostgresConfig) {
    const client = postgres(options.postgres.url, options.postgres.config);

    try {
      await client`SELECT NOW() as current_time`;
    } catch (error) {
      this.logger.error('Unable to connect to the database');
      throw error;
    }

    return drizzle(client, {
      ...options.config,
      schema: { ...schema },
    });
  }
}
