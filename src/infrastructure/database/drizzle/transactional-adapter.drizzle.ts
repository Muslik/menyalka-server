import { Injectable } from '@nestjs/common';
import { PgTransactionConfig } from 'drizzle-orm/pg-core';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Effect } from 'effect';

import { TransactionalAdapter } from '~/infrastructure/lib/effect/plugin-transactional';

import { Schema } from '../types';

@Injectable()
export class TransactionalAdapterDrizzle
  implements TransactionalAdapter<PostgresJsDatabase<Schema>, PostgresJsDatabase<Schema>, PgTransactionConfig> {
  connectionToken: any;

  defaultTxOptions?: Partial<PgTransactionConfig>;

  constructor(drizzleInstanceToken: any, defaultTxOptions: Partial<PgTransactionConfig>) {
    this.connectionToken = drizzleInstanceToken;
    this.defaultTxOptions = defaultTxOptions;
  }

  optionsFactory(drizzle: PostgresJsDatabase<Schema>) {
    return {
      wrapWithTransaction: (
        options: PgTransactionConfig,
        fn: (...args: any[]) => Effect.Effect<any, any>,
        setTx: (client: PostgresJsDatabase<Schema>) => void,
      ) => {
        return Effect.tryPromise({
          try: () =>
            drizzle.transaction(async () => {
              // Set the transaction context
              setTx(drizzle);

              // Run the `Effect` inside the transaction and return the result as a Promise
              return await Effect.runPromise(fn()); // Ensure `fn()` is executed as a Promise
            }, options),
          catch: (error) => {
            console.log('Error in transaction', error);

            return error;
          }, // Map any error to a catchable form for Effect
        });
      },
      getFallbackInstance: () => drizzle,
    };
  }
  /* const program = Effect.gen(function* () { */
  /*   // Retrieve the transaction amount */
  /*   const transactionAmount = yield* fetchTransactionAmount */
  /*   */
  /*   // Retrieve the discount rate */
  /*   const discountRate = yield* fetchDiscountRate */
  /*   */
  /*   // Calculate discounted amount */
  /*   const discountedAmount = yield* applyDiscount( */
  /*     transactionAmount, */
  /*     discountRate */
  /*   ) */
  /*   */
  /*   // Apply service charge */
  /*   const finalAmount = addServiceCharge(discountedAmount) */
  /*   */
  /*   // Return the total amount after applying the charge */
  /*   return `Final amount to charge: ${finalAmount}` */
  /* }) */

  /* optionsFactory(drizzle: PostgresJsDatabase<Schema>) { */
  /*   return { */
  /*     wrapWithTransaction: async ( */
  /*       options: PgTransactionConfig, */
  /*       fn: (...args: any[]) => Effect.Effect<any, any>, // The function `fn` now returns an Effect */
  /*       setTx: (client: PostgresJsDatabase<Schema>) => void, */
  /*     ): Promise<any> => { */
  /*       return drizzle.transaction(async (tx) => { */
  /*         console.log('Running transaction', tx, fn); */
  /*         setTx(tx); */
  /*         return Effect.runPromise(fn()); */
  /*       }); */
  /*     }, */
  /*     getFallbackInstance: () => drizzle, */
  /*   }; */
  /* } */

  /* optionsFactory(drizzle: PostgresJsDatabase<Schema>) { */
  /*   return { */
  /*     wrapWithTransaction: async ( */
  /*       options: PgTransactionConfig, */
  /*       fn: (...args: any[]) => Promise<any>, */
  /*       setTx: (client: PostgresJsDatabase<Schema>) => void, */
  /*     ) => { */
  /*       return await drizzle.transaction(async (tx) => { */
  /*         setTx(tx); */
  /*         return fn(); */
  /*       }, options); */
  /*     }, */
  /*     getFallbackInstance: () => drizzle, */
  /*   }; */
  /* } */
}
