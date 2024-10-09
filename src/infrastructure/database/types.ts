import { BuildQueryResult, DBQueryConfig, ExtractTablesWithRelations } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from './drizzle/schema';

export type Schema = typeof schema;

export type Database = PostgresJsDatabase<Schema>;

type TSchema = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<
  'one' | 'many',
  boolean,
  TSchema,
  TSchema[TableName]
>['with'];

export type InferResultType<
  TableName extends keyof TSchema,
  With extends IncludeRelation<TableName> | undefined = undefined,
> = BuildQueryResult<
  TSchema,
  TSchema[TableName],
  {
    with: With;
  }
>;

export type RoleSchema = Schema['roles'];
export type Role = RoleSchema['$inferSelect'];
export type RoleInsert = RoleSchema['$inferInsert'];

export type PermissionSchema = Schema['permissions'];
export type Permission = PermissionSchema['$inferSelect'];
export type PermissionInsert = PermissionSchema['$inferInsert'];

export type UserSchema = Schema['users'];
export type User = UserSchema['$inferSelect'];
export type UserInsert = UserSchema['$inferInsert'];

export type UserSocialCredentialsSchema = Schema['userSocialCredentials'];
export type UserSocialCredentialsInsert = UserSocialCredentialsSchema['$inferInsert'];
export type UserSocialCredentials = InferResultType<'userSocialCredentials'>;
export type UserWithSocialCredentials = InferResultType<'users', { userSocialCredentials: true }>;
export type UserWithRoles = InferResultType<
  'users',
  { role: { with: { rolesToPermissions: { with: { permission: true } } } } }
>;

export type UserWithSocialCredentialsAndRoles = InferResultType<
  'users',
  {
    userSocialCredentials: true;
    role: { columns: { id: false }; with: { rolesToPermissions: { with: { permission: true } } } };
  }
>;
