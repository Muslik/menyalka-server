import { DomainEvent, DomainEventProps } from "~/libs/ddd";

export class UserCreatedDomainEvent extends DomainEvent {
  readonly email: string | null;
  readonly username: string;
  readonly description: string | null;
  readonly sex: boolean | null;

  constructor(props: DomainEventProps<UserCreatedDomainEvent>) {
    super(props);
    this.email = props.email;
    this.username = props.username;
    this.description = props.description
    this.sex = props.sex;
  }
}
