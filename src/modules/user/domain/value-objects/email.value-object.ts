import { DomainPrimitive, ValueObject } from "~/libs/ddd";
import { isEmpty, isEmail } from 'class-validator';
import { ArgumentInvalidException } from "~/libs/exceptions";

export class Email extends ValueObject<string> {
  get value(): string {
    return this.props.value;
  }

  protected validate({ value }: DomainPrimitive<string>): void {
    if (!isEmpty(value) && !isEmail(value)) {
      throw new ArgumentInvalidException('Email is invalid');
    }
  }
}
