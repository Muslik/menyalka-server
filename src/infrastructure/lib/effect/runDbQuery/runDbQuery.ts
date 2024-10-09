import { Effect, pipe } from 'effect';
import { PostgresError } from 'postgres';

export class DatabaseError extends PostgresError {
  _tag = 'DatabaseError';
  constructor(originalError: unknown) {
    super(originalError as string);
  }
}

export const runDbQuery = <T>(query: () => Promise<T>): Effect.Effect<T, DatabaseError> => {
  return pipe(
    Effect.tryPromise({
      try: query,
      catch: (error) => {
        return new DatabaseError(error);
      },
    }),
  );
};
