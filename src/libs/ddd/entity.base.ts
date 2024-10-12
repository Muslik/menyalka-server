import { convertPropsToObject } from '../utils/convert-props-to-object';
import { Guard } from '../guard';
import { ArgumentInvalidException, ArgumentNotProvidedException, ArgumentOutOfRangeException } from '../exceptions';

export type AggregateID = string;

export interface BaseEntityProps {
  id: AggregateID;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEntityProps<T> {
  id: AggregateID;
  props: T;
  createdAt?: Date;
  updatedAt?: Date;
}

const MAX_PROPS = 50;

export abstract class Entity<EntityProps> {
  constructor({ id, createdAt, props, updatedAt }: CreateEntityProps<EntityProps>) {
    this.setId(id);
    const now = new Date();
    this._createdAt = createdAt || now;
    this._updatedAt = updatedAt || now;
    this.props = props;
    this.validate();
  }

  protected abstract _id: AggregateID;
  protected readonly props: EntityProps;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  public abstract validate(): void;

  get id(): AggregateID {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  private setId(id: AggregateID): void {
    this._id = id;
  }

  static isEntity(entity: unknown): entity is Entity<unknown> {
    return entity instanceof Entity;
  }

  public equals(object?: Entity<EntityProps>): boolean {
    if (object == null || object == undefined) {
      return false;
    }
    if (this === object) {
      return true;
    }
    if (!Entity.isEntity(object)) {
      return false;
    }

    return this.id === object.id;
  }

  public getProps(): EntityProps & BaseEntityProps {
    const props = {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...this.props,
    };

    return Object.freeze(props);
  }

  public toObject(): unknown {
    const plainProps = convertPropsToObject(this.props);

    const result = {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...plainProps,
    };

    return Object.freeze(result);
  }

  private validateProps(props: EntityProps): void {
    if (Guard.isEmpty(props)) {
      throw new ArgumentNotProvidedException('Entity props should not be empty');
    }
    if (typeof props !== 'object') {
      throw new ArgumentInvalidException('Entity props should be an object');
    }
    if (Object.keys(props as any).length > MAX_PROPS) {
      throw new ArgumentOutOfRangeException(`Entity props should not have more than ${MAX_PROPS} properties`);
    }
  }
}

