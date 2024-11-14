import { Effect, Option } from 'effect';

import { Role, RoleId } from '~/libs/database';

export interface IUserServiceOptions {
  getRoleById(roleId: RoleId): Effect.Effect<Option.Option<Role>, Error>;
}
