import { Effect, Option } from 'effect';

import { PermissionId, Role, RoleId, RoleInsert } from '~/libs/database';

export interface IRoleRepository {
  getRoleById(roleId: RoleId): Effect.Effect<Option.Option<Role>>;
  createRoles(roles: RoleInsert[]): Effect.Effect<Role[]>;
  deleteRole(roleId: RoleId): Effect.Effect<void>;
  assignPermissionToRole(roleId: RoleId, permissionId: PermissionId): Effect.Effect<void>;
  unassignPermissionFromRole(roleId: RoleId, permissionId: PermissionId): Effect.Effect<void>;
}
