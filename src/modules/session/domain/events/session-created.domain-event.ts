import { DomainEvent, DomainEventProps } from "~/libs/ddd";

export class SessionCreatedDomainEvent extends DomainEvent {
  readonly sessionId: string;
  readonly userAgent: string;
  readonly ip: string;
  readonly lastAccessDate: Date;
  readonly userId: number;

  constructor(props: DomainEventProps<SessionCreatedDomainEvent>) {
    super(props);
  }
}
