import { maxLength } from 'class-validator';

import { DomainPrimitive, ValueObject } from '~/libs/ddd';
import { ArgumentOutOfRangeException } from '~/libs/exceptions';

const MAX_DESCRIPTION_LENGTH = 255;

export class Description extends ValueObject<string> {
  get value(): string {
    return this.props.value;
  }

  protected validate({ value }: DomainPrimitive<string>): void {
    if (!maxLength(value, MAX_DESCRIPTION_LENGTH)) {
      throw new ArgumentOutOfRangeException('Description is out of range');
    }
  }
}
