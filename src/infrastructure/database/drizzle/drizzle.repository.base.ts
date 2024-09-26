import { schema as mainSchema, Schema } from '..';

export abstract class DrizzleRepositoryBase<T = Schema> {
  private innerSchema: Schema = mainSchema;
  public schema: T;

  constructor(cb: (schema: Schema) => T) {
    this.schema = cb(this.innerSchema);
  }
}
