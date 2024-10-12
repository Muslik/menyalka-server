import { Effect } from 'effect';

import { DatabaseError, UserSocialCredentials, UserSocialCredentialsInsert } from '~/infrastructure/database';

export interface IUserSocialCredentialsRepository {
  insert(entity: UserSocialCredentialsInsert): Effect.Effect<UserSocialCredentials[], DatabaseError>;
}
