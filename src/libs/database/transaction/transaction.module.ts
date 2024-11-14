import { DynamicModule, Global, Module } from '@nestjs/common';
import { PgTransactionConfig } from 'drizzle-orm/pg-core';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { DATABASE } from '../database.constants';
import { Schema } from '../types';
import { TransactionHost } from './transaction-host';
import { TRANSACTION_REPOSITORY } from './transaction.constants';
import { TransactionRepository } from './transaction.repository';

export type TransactionModuleOptions = Partial<PgTransactionConfig>;

@Global()
@Module({})
export class TransactionModule {
  static register(options: TransactionModuleOptions): DynamicModule {
    return {
      module: TransactionModule,
      global: true,
      providers: [
        TransactionHost,
        {
          provide: TRANSACTION_REPOSITORY,
          useFactory: (transactionHost: TransactionHost, drizzle: PostgresJsDatabase<Schema>) => {
            return new TransactionRepository(transactionHost, drizzle, options);
          },
          inject: [TransactionHost, DATABASE],
        },
      ],
      exports: [TransactionHost, TRANSACTION_REPOSITORY],
    };
  }
}
