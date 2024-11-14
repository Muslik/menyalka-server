import { Injectable } from '@nestjs/common';
import { Effect, pipe } from 'effect';

import {
  DrizzleRepositoryBase,
  TransactionHost,
  UserSocialCredentials,
  UserSocialCredentialsInsert,
} from '~/libs/database';

import { IUserSocialCredentialsRepository } from './userSocialCredentialsRepository.interface';

@Injectable()
export class UserSocialCredentialsRepository extends DrizzleRepositoryBase implements IUserSocialCredentialsRepository {
  constructor(private readonly txHost: TransactionHost) {
    super();
  }

  insert(entity: UserSocialCredentialsInsert): Effect.Effect<UserSocialCredentials> {
    console.log('Insert');
    return pipe(
      Effect.promise(() => this.txHost.tx.insert(this.schema.userSocialCredentials).values(entity).returning()),
      Effect.andThen(([createdUser]) => createdUser),
    );
  }
}
