import { Injectable } from '@nestjs/common';
import { Effect } from 'effect';

import { DrizzleRepositoryBase, Permission, PermissionInsert, TransactionHost } from '~/libs/database';

import { IPermissionsRepository } from './permission.repository.interface';

@Injectable()
export class PermissionRepository extends DrizzleRepositoryBase implements IPermissionsRepository {
  private readonly permissions = this.schema.permissions;
  constructor(private readonly txHost: TransactionHost) {
    super();
  }

  createPermissions(permissions: PermissionInsert[]): Effect.Effect<Permission[]> {
    return Effect.promise(() => this.txHost.tx.insert(this.permissions).values(permissions).returning());
  }
}
