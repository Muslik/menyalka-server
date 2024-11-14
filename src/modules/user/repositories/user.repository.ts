import { Injectable } from '@nestjs/common';
import { Effect, Option, pipe } from 'effect';

import { DrizzleRepositoryBase, ProviderId, User, UserId, UserInsert, Username, UserWithRoles } from '~/libs/database';
import { TransactionHost } from '~/libs/database/transaction';

import { IUserRepository } from './user.repository.interface';

@Injectable()
export class UserRepository extends DrizzleRepositoryBase implements IUserRepository {
  constructor(private readonly txHost: TransactionHost) {
    super();
  }

  findOne(userId: UserId): Effect.Effect<Option.Option<User>> {
    return pipe(
      Effect.promise(() => this.txHost.tx.query.users.findFirst({ where: (users, { eq }) => eq(users.id, userId) })),
      Effect.map(Option.fromNullable),
    );
  }

  save(entity: UserInsert): Effect.Effect<User> {
    return pipe(
      Effect.promise(() => this.txHost.tx.insert(this.schema.users).values(entity).returning()),
      Effect.map((users) => users[0]),
    );
  }

  findUserByUsername(username: Username): Effect.Effect<Option.Option<User>> {
    return pipe(
      Effect.promise(() =>
        this.txHost.tx.query.users.findFirst({ where: (users, { eq }) => eq(users.username, username) }),
      ),
      Effect.map(Option.fromNullable),
    );
  }

  findAll(): Effect.Effect<User[]> {
    return Effect.promise(() => this.txHost.tx.query.users.findMany());
  }

  findUserWithRoles(userId: UserId): Effect.Effect<Option.Option<UserWithRoles>> {
    return pipe(
      Effect.promise(() =>
        this.txHost.tx.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, userId),
          with: {
            role: {
              with: {
                rolesToPermissions: {
                  with: { permission: true },
                },
              },
            },
          },
        }),
      ),
      Effect.map(Option.fromNullable),
    );
  }

  findUserByProviderIdWithRoles(providerUserId: ProviderId): Effect.Effect<Option.Option<UserWithRoles>> {
    return pipe(
      Effect.promise(() =>
        this.txHost.tx.query.users.findFirst({
          with: {
            userSocialCredentials: {
              where: (socialCredentials, { eq }) => eq(socialCredentials.providerId, providerUserId),
            },
            role: {
              with: { rolesToPermissions: { with: { permission: true } } },
            },
          },
        }),
      ),
      Effect.map(Option.fromNullable),
    );
  }
}
