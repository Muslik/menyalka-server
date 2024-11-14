import { Injectable } from '@nestjs/common';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import { PgTransaction, PgTransactionConfig } from 'drizzle-orm/pg-core';
import { PostgresJsDatabase, PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import { Effect } from 'effect';

import { Schema } from '../types';
import { TransactionHost } from './transaction-host';

@Injectable()
export class TransactionRepository {
  constructor(
    private readonly transactionHost: TransactionHost,
    private readonly drizzle: PostgresJsDatabase<Schema>,
    private readonly options?: Partial<PgTransactionConfig>,
  ) {}

  withTransaction(
    callback: (
      tx: PgTransaction<PostgresJsQueryResultHKT, Schema, ExtractTablesWithRelations<Schema>>,
    ) => Effect.Effect<any>,
    options?: Partial<PgTransactionConfig>,
  ) {
    return Effect.promise(() =>
      this.drizzle
        .transaction(async (tx) => {
          this.transactionHost.setTxInstance(tx);
          return Effect.runPromise(callback(tx));
        }, options || this.options)
        .finally(() => this.transactionHost.setTxInstance(undefined)),
    );
  }
}
