import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });

(async () => {
  try {
    console.log('Applying migrations...');

    const db = drizzle(client);
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
