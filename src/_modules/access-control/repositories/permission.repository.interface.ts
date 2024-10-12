import { Effect } from 'effect';

import { Permission, PermissionInsert } from '~/infrastructure/database';

export interface IPermissionsRepository {
  createPermissions(permissions: PermissionInsert[]): Effect.Effect<Permission[], Error>;
}
