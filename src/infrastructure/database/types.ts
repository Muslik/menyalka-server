import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from './drizzle/schema';

export type Schema = typeof schema;

export type Database = PostgresJsDatabase<Schema>;

export type UserSchema = Schema['users'];
export type User = UserSchema['$inferSelect'];
export type UserInsert = UserSchema['$inferInsert'];
