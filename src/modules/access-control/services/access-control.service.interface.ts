import { Effect, Option } from 'effect';

import { B, Role } from '~/infrastructure/database';

import { ReadOnlyRoleError } from '../access-control.errors';
import { CreateRoleDto } from '../dto/create-role.dto';

export interface IAccessControlService {
  getRoleById(roleId: B.RoleId): Effect.Effect<Option.Option<Role>, Error>;
  createRole(role: CreateRoleDto): Effect.Effect<Role, Error>;
  deleteRole(roleId: B.RoleId): Effect.Effect<void, ReadOnlyRoleError | Error>;
  assignPermissionToRole(roleId: B.RoleId, permissionId: B.PermissionId): Effect.Effect<void, ReadOnlyRoleError | Error>;
  unassignPermissionFromRole(
    roleId: B.RoleId,
    permissionId: B.PermissionId,
  ): Effect.Effect<void, ReadOnlyRoleError | Error>;
}
