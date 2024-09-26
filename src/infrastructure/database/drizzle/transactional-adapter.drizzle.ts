import { TransactionalAdapter } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { PgTransactionConfig } from 'drizzle-orm/pg-core';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { Schema } from '../types';

@Injectable()
export class TransactionalAdapterDrizzle
  implements TransactionalAdapter<PostgresJsDatabase<Schema>, PostgresJsDatabase<Schema>, PgTransactionConfig>
{
  connectionToken: any;

  defaultTxOptions?: Partial<PgTransactionConfig>;

  constructor(drizzleInstanceToken: any, defaultTxOptions: Partial<PgTransactionConfig>) {
    this.connectionToken = drizzleInstanceToken;
    this.defaultTxOptions = defaultTxOptions;
  }

  optionsFactory(drizzle: PostgresJsDatabase<Schema>) {
    return {
      wrapWithTransaction: async (
        options: PgTransactionConfig,
        fn: (...args: any[]) => Promise<any>,
        setTx: (client: PostgresJsDatabase<Schema>) => void,
      ) => {
        return await drizzle.transaction(async (tx) => {
          setTx(tx);
          return fn();
        }, options);
      },
      getFallbackInstance: () => drizzle,
    };
  }
}
