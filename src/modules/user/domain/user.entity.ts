import { randomUUID } from 'crypto';

import { AggregateID, AggregateRoot } from '~/libs/ddd';

import { UserCreatedDomainEvent } from './events/user-created.domain-event';
import { UserDeletedDomainEvent } from './events/user-deleted.domain-event';
import { UserRoleChangedDomainEvent } from './events/user-role-changed.domain-event';
import { UserUpdatedDomainEvent } from './events/user-updated.domain-event';
import { CreateUserProps, UpdateUserProps, UserProps, UserRoles } from './user.types';
import { Description } from './value-objects/description.value-object';
import { Email } from './value-objects/email.value-object';
import { Sex, SexEnum } from './value-objects/sex.value-object';
import { SocialCredentialEntity } from './entities/social-credential.entity';

export class UserEntity extends AggregateRoot<UserProps> {
  protected readonly _id: AggregateID;

  static create(create: CreateUserProps): UserEntity {
    const id = randomUUID();
    const props: UserProps = {
      ...create,
      description: create.description ?? new Description({ value: '' }),
      email: create.email ?? null,
      role: UserRoles.User,
      sex: create.sex ?? new Sex({ value: SexEnum.None }),
    };

    const user = new UserEntity({ id, props });

    const sex = props.sex?.unpack();
    user.addEvent(
      new UserCreatedDomainEvent({
        aggregateId: id,
        sex: sex === SexEnum.None ? null : sex === SexEnum.Male,
        description: props.description?.unpack() ?? null,
        email: props.email?.unpack() ?? null,
        username: props.username.unpack() ?? null,
      }),
    );

    return user;
  }

  get socialCredentials(): SocialCredentialEntity[] {
    return this.props.socialCredentials ?? [];
  }

  get role(): UserRoles {
    return this.props.role;
  }

  private changeRole(newRole: UserRoles): void {
    this.addEvent(
      new UserRoleChangedDomainEvent({
        aggregateId: this.id,
        oldRole: this.props.role,
        newRole,
      }),
    );
    this.props.role = newRole;
  }

  makeAdmin(): void {
    this.changeRole(UserRoles.Admin);
  }

  makeUser(): void {
    this.changeRole(UserRoles.User);
  }

  makeModerator(): void {
    this.changeRole(UserRoles.Moderator);
  }

  banUser(): void {
    this.changeRole(UserRoles.Banned);
  }

  delete(): void {
    this.addEvent(
      new UserDeletedDomainEvent({
        aggregateId: this.id,
      }),
    );
  }

  updateUser(props: UpdateUserProps): void {
    const newUser = { ...this.props };
    if (props.email !== undefined) {
      newUser.email = props.email ? new Email({ value: props.email }) : null;
    }
    if (props.description !== undefined) {
      newUser.description = new Description({ value: props.description });
    }
    if (props.sex !== undefined) {
      newUser.sex = new Sex({ value: props.sex });
    }

    this.addEvent(
      new UserUpdatedDomainEvent({
        aggregateId: this.id,
        oldUser: this.props,
        newUser,
      }),
    );

    this.props.email = newUser.email;
    this.props.description = newUser.description;
    this.props.sex = newUser.sex;
  }

  validate(): void {}
}
