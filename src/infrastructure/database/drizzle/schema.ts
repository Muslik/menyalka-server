import { bigserial, pgTable, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: varchar('email').unique().notNull(),
  avatarColor: varchar('avatar_color').notNull(),
  username: varchar('username').unique().notNull(),
  phone: varchar('phone').unique(),
});
