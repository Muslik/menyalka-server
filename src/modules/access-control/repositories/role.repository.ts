import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { pipe, Option, Effect } from 'effect';

import {
  DrizzleRepositoryBase,
  RoleInsert,
  Role,
  TransactionHost,
  RoleId,
  UserId,
  PermissionId,
} from '~/libs/database';

import { IRoleRepository } from './role.repository.interface';

@Injectable()
export class RoleRepository extends DrizzleRepositoryBase implements IRoleRepository {
  private readonly roles = this.schema.roles;
  private readonly rolesToPermissions = this.schema.rolesToPermissions;
  private readonly users = this.schema.users;
  constructor(private readonly txHost: TransactionHost) {
    super();
  }

  getRoleById(roleId: RoleId): Effect.Effect<Option.Option<Role>> {
    return pipe(
      Effect.promise(() => this.txHost.tx.query.roles.findFirst({ where: (roles, { eq }) => eq(roles.id, roleId) })),
      Effect.map(Option.fromNullable),
    );
  }

  createRoles(roles: RoleInsert[]): Effect.Effect<Role[]> {
    return Effect.promise(() => this.txHost.tx.insert(this.roles).values(roles).returning());
  }

  deleteRole(roleId: RoleId): Effect.Effect<void> {
    return Effect.promise(() => this.txHost.tx.delete(this.roles).where(eq(this.roles.id, roleId)));
  }

  assignRoleToUser(roleId: RoleId, userId: UserId): Effect.Effect<void> {
    return Effect.promise(() => this.txHost.tx.update(this.users).set({ roleId }).where(eq(this.users.id, userId)));
  }

  assignPermissionToRole(roleId: RoleId, permissionId: PermissionId): Effect.Effect<void> {
    return Effect.promise(() => this.txHost.tx.insert(this.rolesToPermissions).values({ roleId, permissionId }));
  }

  unassignPermissionFromRole(roleId: RoleId, permissionId: PermissionId): Effect.Effect<void> {
    return Effect.promise(() =>
      this.txHost.tx
        .delete(this.rolesToPermissions)
        .where(and(eq(this.rolesToPermissions.permissionId, permissionId), eq(this.rolesToPermissions.roleId, roleId))),
    );
  }
}
