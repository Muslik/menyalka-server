import { ValueObject } from "~/libs/ddd";

export enum SexEnum {
  Female = 0,
  Male = 1,
  None = 2,
}

export class Sex extends ValueObject<SexEnum> {
  get value(): SexEnum {
    return this.props.value;
  }

  validate(): void {}
}
