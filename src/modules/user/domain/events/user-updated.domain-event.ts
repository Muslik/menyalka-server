import { DomainEvent, DomainEventProps } from '~/libs/ddd';

import { UserProps } from '../user.types';

export class UserUpdatedDomainEvent extends DomainEvent {
  readonly oldUser: UserProps;

  readonly newUser: UserProps;

  constructor(props: DomainEventProps<UserUpdatedDomainEvent>) {
    super(props);
    this.oldUser = props.oldUser;
    this.newUser = props.newUser;
  }
}
