import { Injectable } from '@nestjs/common';
import { Effect } from 'effect';

import {
  DrizzleRepositoryBase,
  TransactionalAdapterDrizzle,
  UserSocialCredentials,
  UserSocialCredentialsInsert,
} from '~/infrastructure/database';

import { IUserSocialCredentialsRepository } from './userSocialCredentialsRepository.interface';
import { TransactionHost } from '~/infrastructure/lib/effect/plugin-transactional';

@Injectable()
export class UserSocialCredentialsRepository extends DrizzleRepositoryBase implements IUserSocialCredentialsRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterDrizzle>) {
    super();
  }

  insert(entity: UserSocialCredentialsInsert): Effect.Effect<UserSocialCredentials[], Error> {
    return Effect.tryPromise(() => this.txHost.tx.insert(this.schema.userSocialCredentials).values(entity).returning());
  }
}
