import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { schema } from '~/libs/database';

import { seedRolesAndPermissions } from './seedRolesAndPermissions';

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
  console.log('Connecting to the database...');
  await client`SELECT NOW()`.catch((error) => {
    throw new Error(`Unable to connect to the database: ${error}`);
  });

  const db = drizzle<typeof schema>(client, { schema });

  try {
    await seedRolesAndPermissions(db);
  } catch (error) {
    process.exit(1);
  } finally {
    await client.end();
  }
})();
