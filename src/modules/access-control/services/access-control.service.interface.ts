import { Effect, Option } from 'effect';

import { PermissionId, Role, RoleId } from '~/libs/database';

import { ReadOnlyRoleError } from '../access-control.errors';
import { CreateRoleDto } from '../dto/create-role.dto';

export interface IAccessControlService {
  getRoleById(roleId: RoleId): Effect.Effect<Option.Option<Role>, Error>;
  createRole(role: CreateRoleDto): Effect.Effect<Role, Error>;
  deleteRole(roleId: RoleId): Effect.Effect<void, ReadOnlyRoleError | Error>;
  assignPermissionToRole(roleId: RoleId, permissionId: PermissionId): Effect.Effect<void, ReadOnlyRoleError | Error>;
  unassignPermissionFromRole(
    roleId: RoleId,
    permissionId: PermissionId,
  ): Effect.Effect<void, ReadOnlyRoleError | Error>;
}
