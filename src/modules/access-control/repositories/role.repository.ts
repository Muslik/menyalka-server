import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { pipe, Option, Effect } from 'effect';

import {
  DrizzleRepositoryBase,
  RoleInsert,
  Role,
  TransactionalAdapterDrizzle,
  B,
} from '~/infrastructure/database';

import { IRoleRepository } from './role.repository.interface';
import { TransactionHost } from '~/infrastructure/lib/effect/plugin-transactional';

@Injectable()
export class RoleRepository extends DrizzleRepositoryBase implements IRoleRepository {
  private readonly roles = this.schema.roles;
  private readonly rolesToPermissions = this.schema.rolesToPermissions;
  private readonly users = this.schema.users;
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterDrizzle>) {
    super();
  }

  getRoleById(roleId: B.RoleId): Effect.Effect<Option.Option<Role>, Error> {
    return pipe(
      Effect.tryPromise(() => this.txHost.tx.query.roles.findFirst({ where: (roles, { eq }) => eq(roles.id, roleId) })),
      Effect.map(Option.fromNullable),
    );
  }

  createRoles(roles: RoleInsert[]): Effect.Effect<Role[], Error> {
    return Effect.tryPromise(() => this.txHost.tx.insert(this.roles).values(roles).returning());
  }

  deleteRole(roleId: B.RoleId): Effect.Effect<void, Error> {
    return Effect.tryPromise(() => this.txHost.tx.delete(this.roles).where(eq(this.roles.id, roleId)));
  }

  assignRoleToUser(roleId: B.RoleId, userId: B.UserId): Effect.Effect<void, Error> {
    return Effect.tryPromise(() => this.txHost.tx.update(this.users).set({ roleId }).where(eq(this.users.id, userId)));
  }

  assignPermissionToRole(roleId: B.RoleId, permissionId: B.PermissionId): Effect.Effect<void, Error> {
    return Effect.tryPromise(() => this.txHost.tx.insert(this.rolesToPermissions).values({ roleId, permissionId }));
  }

  unassignPermissionFromRole(roleId: B.RoleId, permissionId: B.PermissionId): Effect.Effect<void, Error> {
    return Effect.tryPromise(() =>
      this.txHost.tx
        .delete(this.rolesToPermissions)
        .where(and(eq(this.rolesToPermissions.permissionId, permissionId), eq(this.rolesToPermissions.roleId, roleId))),
    );
  }
}
