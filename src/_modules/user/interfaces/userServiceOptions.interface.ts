import { Effect, Option } from 'effect';

import { Role, B } from '~/infrastructure/database';

export interface IUserServiceOptions {
  getRoleById(roleId: B.RoleId): Effect.Effect<Option.Option<Role>, Error>;
}
