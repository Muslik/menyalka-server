import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env'
    : process.env.NODE_ENV === 'development'
      ? '.env.development'
      : '.env.test';

dotenv.config({ path: envFile });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL);

(async () => {
  try {
    console.log('Connecting to the database...');
    await client`SELECT NOW()`.catch((error) => {
      throw new Error(`Unable to connect to the database: ${error}`);
    });

    const db = drizzle(client);

    console.log('Applying migrations...');
    await migrate(db, { migrationsFolder: 'database/migrations', migrationsSchema: 'public' });

    console.log('Migrations applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);

    process.exit(1);
  } finally {
    await client.end();
  }
})();
