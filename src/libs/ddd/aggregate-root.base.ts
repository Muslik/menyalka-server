import { EventEmitter2 } from '@nestjs/event-emitter';
import { Effect, pipe } from 'effect';

import { LoggerPort } from '~/libs/ports/logger.port';

import { RequestContextService } from '../app/context/app-request-context';
import { DomainEvent } from './domain-event.base';
import { Entity } from './entity.base';

export abstract class AggregateRoot<EntityProps> extends Entity<EntityProps> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  public publishEvents(logger: LoggerPort, eventEmitter: EventEmitter2): Effect.Effect<void> {
    return pipe(
      Effect.all(
        this.domainEvents.map((event) => {
          logger.debug(
            `[${RequestContextService.getRequestId()}] "${event.constructor.name
            }" event published for aggregate ${this.constructor.name} : ${this.id}`,
          );
          return Effect.promise(() => eventEmitter.emitAsync(event.constructor.name, event));
        }),
      ),
      Effect.tap(() => this.clearEvents()),
    );
  }
}
