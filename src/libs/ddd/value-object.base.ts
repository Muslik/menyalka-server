import { ArgumentNotProvidedException } from "../exceptions";
import { Guard } from "../guard";
import { convertPropsToObject } from "../utils/convert-props-to-object";

export type Primitives = string | number | boolean;
export interface DomainPrimitive<T extends Primitives | Date> {
  value: T;
}

type ValueObjectProps<T> = T extends Primitives | Date ? DomainPrimitive<T> : T;

export abstract class ValueObject<T> {
  protected readonly props: ValueObjectProps<T>;

  constructor(props: ValueObjectProps<T>) {
    this.checkIfEmpty(props);
    this.props = props;
    console.log('props', this.validate, props);
    this.validate(props);
  }

  protected abstract validate(props: ValueObjectProps<T>): void;

  static isValueObject(value: unknown): value is ValueObject<unknown> {
    return value instanceof ValueObject;
  }

  public equals(valueObject?: ValueObject<T>): boolean {
    if (valueObject == null || valueObject == undefined) {
      return false;
    }

    return JSON.stringify(this) === JSON.stringify(valueObject);
  }

  public unpack(): T {
    if (this.isDomainPrimitive(this.props)) {
      return this.props.value;
    }

    const propsCopy = convertPropsToObject(this.props);

    return Object.freeze(propsCopy);
  }

  private checkIfEmpty(props: ValueObjectProps<T>): void {
    if (Guard.isEmpty(props) || (this.isDomainPrimitive(props) && Guard.isEmpty(props))) {
      throw new ArgumentNotProvidedException('Property couldn\'t be empty');
    }
  }

  private isDomainPrimitive(obj: unknown): obj is DomainPrimitive<T & (Primitives | Date)> {
    return Object.prototype.hasOwnProperty.call(obj, 'value');
  }
}
