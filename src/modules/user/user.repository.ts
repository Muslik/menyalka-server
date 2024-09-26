import { TransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';

import { DrizzleRepositoryBase, TransactionalAdapterDrizzle, UserSchema } from '~/infrastructure/database';

import { IUserRepository } from './user.repository.interface';

@Injectable()
export class UserRepository extends DrizzleRepositoryBase<UserSchema> implements IUserRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterDrizzle>) {
    super((schema) => schema.users);
  }

  findAll() {
    return this.txHost.tx.query.users.findMany();
  }
}
