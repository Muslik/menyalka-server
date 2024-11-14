import { Effect } from 'effect';

import { UserSocialCredentials, UserSocialCredentialsInsert } from '~/libs/database';

export interface IUserSocialCredentialsRepository {
  insert(entity: UserSocialCredentialsInsert): Effect.Effect<UserSocialCredentials>;
}
