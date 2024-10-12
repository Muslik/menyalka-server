import { Effect, Option } from 'effect';

import { B, Role, RoleInsert } from '~/infrastructure/database';

export interface IRoleRepository {
  getRoleById(roleId: B.RoleId): Effect.Effect<Option.Option<Role>, Error>;
  createRoles(roles: RoleInsert[]): Effect.Effect<Role[], Error>;
  deleteRole(roleId: B.RoleId): Effect.Effect<void, Error>;
  assignPermissionToRole(roleId: B.RoleId, permissionId: B.PermissionId): Effect.Effect<void, Error>;
  unassignPermissionFromRole(roleId: B.RoleId, permissionId: B.PermissionId): Effect.Effect<void, Error>;
}
