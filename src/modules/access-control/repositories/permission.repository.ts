import { Injectable } from '@nestjs/common';
import { Effect } from 'effect';

import {
  DrizzleRepositoryBase,
  Permission,
  PermissionInsert,
  TransactionalAdapterDrizzle,
} from '~/infrastructure/database';
import { TransactionHost } from '~/infrastructure/lib/effect/plugin-transactional';

import { IPermissionsRepository } from './permission.repository.interface';

@Injectable()
export class PermissionRepository extends DrizzleRepositoryBase implements IPermissionsRepository {
  private readonly permissions = this.schema.permissions;
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterDrizzle>) {
    super();
  }

  createPermissions(permissions: PermissionInsert[]): Effect.Effect<Permission[], Error> {
    return Effect.tryPromise(() => this.txHost.tx.insert(this.permissions).values(permissions).returning());
  }
}
