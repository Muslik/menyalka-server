import { isEmpty, maxLength } from 'class-validator';

import { DomainPrimitive, ValueObject } from '~/libs/ddd';
import { ArgumentNotProvidedException, ArgumentOutOfRangeException } from '~/libs/exceptions';

const MAX_LENGTH = 50;

export class Username extends ValueObject<string> {
  get value(): string {
    return this.props.value;
  }

  protected validate({ value }: DomainPrimitive<string>): void {
    if (isEmpty(value)) {
      throw new ArgumentNotProvidedException('Username is required');
    }
    if (!maxLength(value, MAX_LENGTH)) {
      throw new ArgumentOutOfRangeException('Username is too long');
    }
  }
}
