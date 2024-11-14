import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { ClsService } from 'nestjs-cls';

import { DATABASE } from '../database.constants';
import { Schema } from '../types';

const TRANSACTION_CLS_KEY = Symbol('TRANSACTION_CLS_KEY');

type Store = {
  [TRANSACTION_CLS_KEY]: PostgresJsDatabase;
};

@Injectable()
export class TransactionHost {
  constructor(
    @Inject(DATABASE) private readonly drizzle: PostgresJsDatabase<Schema>,
    private readonly cls: ClsService<Store>,
  ) {}

  get tx(): PostgresJsDatabase<Schema> {
    if (!this.cls.isActive()) {
      return this.drizzle;
    }

    return this.cls.get(TRANSACTION_CLS_KEY) ?? this.drizzle;
  }

  setTxInstance(value?: PostgresJsDatabase<Schema>) {
    this.cls.set(TRANSACTION_CLS_KEY, value);
  }
}
