import { Injectable } from '@nestjs/common';
import { Effect, Option, pipe } from 'effect';

import {
  DrizzleRepositoryBase,
  TransactionalAdapterDrizzle,
  User,
  UserInsert,
  UserWithRoles,
  B,
} from '~/infrastructure/database';
import { DatabaseError, runDbQuery } from '~/infrastructure/lib/effect';
import { Transactional, TransactionHost } from '~/infrastructure/lib/effect/plugin-transactional';

import { IUserRepository } from './user.repository.interface';
import { RoleId } from '~/infrastructure/database/drizzle/brands';

@Injectable()
export class UserRepository extends DrizzleRepositoryBase implements IUserRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterDrizzle>) {
    super();
  }

  findOne(userId: B.UserId): Effect.Effect<Option.Option<User>, Error> {
    return pipe(
      Effect.tryPromise(() => this.txHost.tx.query.users.findFirst({ where: (users, { eq }) => eq(users.id, userId) })),
      Effect.map(Option.fromNullable),
    );
  }

  save(entity: UserInsert): Effect.Effect<User, Error> {
    return pipe(
      Effect.tryPromise(() => this.txHost.tx.insert(this.schema.users).values(entity).returning()),
      Effect.map((users) => users[0]),
    );
  }

  findUserByEmail(email: B.Email): Effect.Effect<Option.Option<User>, Error> {
    return pipe(
      Effect.tryPromise(() =>
        this.txHost.tx.query.users.findFirst({ where: (users, { eq }) => eq(users.email, email) }),
      ),
      Effect.map(Option.fromNullable),
    );
  }

  findUserByUsername(username: B.Username): Effect.Effect<Option.Option<User>, Error> {
    return pipe(
      Effect.tryPromise(() =>
        this.txHost.tx.query.users.findFirst({ where: (users, { eq }) => eq(users.username, username) }),
      ),
      Effect.map(Option.fromNullable),
    );
  }

  @Transactional()
  findAll(): Effect.Effect<User[], DatabaseError> {
    return runDbQuery(async () => {
      await this.txHost.tx.insert(this.schema.users).values({
        username: B.Username('FUCKER PLAYER'),
        roleId: RoleId(1),
      });
      await this.txHost.tx.insert(this.schema.users).values({
        username: 123,
        roleId: RoleId(1),
      });
      return this.txHost.tx.query.users.findMany();
    });
  }

  findUserWithRoles(userId: B.UserId): Effect.Effect<Option.Option<UserWithRoles>, Error> {
    return pipe(
      Effect.tryPromise(() =>
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

  findUserByProviderIdWithRoles(providerUserId: B.ProviderUserId): Effect.Effect<Option.Option<UserWithRoles>, Error> {
    return pipe(
      Effect.tryPromise(() =>
        this.txHost.tx.query.users.findFirst({
          with: {
            userSocialCredentials: {
              where: (socialCredentials, { eq }) => eq(socialCredentials.providerUserId, providerUserId),
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
