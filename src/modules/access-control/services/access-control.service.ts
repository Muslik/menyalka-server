import { Inject, Injectable } from '@nestjs/common';
import { Effect, Option, pipe } from 'effect';

import { RBAC } from '~/config';
import { PermissionId, Role, RoleId } from '~/libs/database';

import { ROLE_REPOSITORY } from '../access-control.constants';
import { ReadOnlyRoleError } from '../access-control.errors';
import { CreateRoleDto } from '../dto/create-role.dto';
import { IRoleRepository } from '../repositories/role.repository.interface';
import { IAccessControlService } from './access-control.service.interface';

@Injectable()
export class AccessControlService implements IAccessControlService {
  constructor(@Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository) {}

  private checkIfRoleEditable(roleId: RoleId): boolean {
    return !RBAC.ROLES.some((role) => role.id === roleId);
  }

  getRoleById(roleId: RoleId): Effect.Effect<Option.Option<Role>, Error> {
    return this.roleRepository.getRoleById(roleId);
  }

  createRole(role: CreateRoleDto): Effect.Effect<Role, Error> {
    return pipe(
      this.roleRepository.createRoles([role]),
      Effect.map((roles) => roles[0]),
    );
  }

  deleteRole(roleId: RoleId): Effect.Effect<void, ReadOnlyRoleError | Error> {
    return Effect.if(this.checkIfRoleEditable(roleId), {
      onTrue: () => this.roleRepository.deleteRole(roleId),
      onFalse: () => Effect.fail(new ReadOnlyRoleError()),
    });
  }

  assignPermissionToRole(roleId: RoleId, permissionId: PermissionId): Effect.Effect<void, ReadOnlyRoleError | Error> {
    return Effect.if(this.checkIfRoleEditable(roleId), {
      onTrue: () => this.roleRepository.assignPermissionToRole(roleId, permissionId),
      onFalse: () => Effect.fail(new ReadOnlyRoleError()),
    });
  }

  unassignPermissionFromRole(
    roleId: RoleId,
    permissionId: PermissionId,
  ): Effect.Effect<void, ReadOnlyRoleError | Error> {
    return Effect.if(this.checkIfRoleEditable(roleId), {
      onTrue: () => this.roleRepository.unassignPermissionFromRole(roleId, permissionId),
      onFalse: () => Effect.fail(new ReadOnlyRoleError()),
    });
  }
}
