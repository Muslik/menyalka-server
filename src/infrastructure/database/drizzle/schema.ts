import { relations } from 'drizzle-orm';
import { primaryKey, boolean, bigserial, pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

import { Email, PermissionId, ProviderUserId, RoleId, UserId, Username } from './brands';

export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).$type<UserId>().primaryKey(),
  username: varchar('username').$type<Username>().unique().notNull(),
  email: varchar('email').$type<Email>().unique(),
  description: varchar('description').notNull().default(''),
  sex: boolean('sex'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  roleId: bigserial('role_id', { mode: 'number' })
    .$type<RoleId>()
    .notNull()
    .references(() => roles.id),
});

export const roles = pgTable('roles', {
  id: bigserial('id', { mode: 'number' }).$type<RoleId>().primaryKey(),
  name: varchar('name').unique().notNull(),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  rolesToPermissions: many(rolesToPermissions),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  userSocialCredentials: many(userSocialCredentials),
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
}));

export const userSocialCredentials = pgTable('user_social_credentials', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  providerUserId: varchar('provider_user_id').$type<ProviderUserId>().notNull(),
  providerType: varchar('provider_type').notNull(),
  userId: bigserial('user_id', { mode: 'number' })
    .$type<UserId>()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const userSocialCredentialsRelations = relations(userSocialCredentials, ({ one }) => ({
  user: one(users, {
    fields: [userSocialCredentials.userId],
    references: [users.id],
  }),
}));

export const permissions = pgTable('permissions', {
  id: bigserial('id', { mode: 'number' }).$type<PermissionId>().primaryKey(),
  description: varchar('description').default('').notNull(),
  name: varchar('name').unique().notNull(),
});

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolesToPermissions: many(rolesToPermissions),
}));

export const rolesToPermissions = pgTable(
  'roles_to_permissions',
  {
    roleId: bigserial('role_id', { mode: 'number' })
      .$type<RoleId>()
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: bigserial('permission_id', { mode: 'number' })
      .$type<PermissionId>()
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
  }),
);

export const rolesToPermissionsRelations = relations(rolesToPermissions, ({ one }) => ({
  role: one(roles, { fields: [rolesToPermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolesToPermissions.permissionId], references: [permissions.id] }),
}));

export const bannedUsersPermissions = pgTable('banned_users_permissions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  reason: varchar('reason').notNull(),
  userId: bigserial('user_id', { mode: 'number' })
    .$type<UserId>()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  permissionId: bigserial('permission_id', { mode: 'number' })
    .$type<PermissionId>()
    .notNull()
    .references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  until: timestamp('until'),
});

export const bannedUsersPermissionsRelations = relations(bannedUsersPermissions, ({ one }) => ({
  user: one(users, { fields: [bannedUsersPermissions.userId], references: [users.id] }),
  permission: one(permissions, { fields: [bannedUsersPermissions.permissionId], references: [permissions.id] }),
}));
