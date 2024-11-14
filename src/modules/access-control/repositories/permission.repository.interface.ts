import { Effect } from 'effect';

import { Permission, PermissionInsert } from '~/libs/database';

export interface IPermissionsRepository {
  createPermissions(permissions: PermissionInsert[]): Effect.Effect<Permission[]>;
}
