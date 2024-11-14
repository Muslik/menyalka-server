import { Schema } from '../types';
import * as mainSchema from './schema';

export abstract class DrizzleRepositoryBase {
  private __schema: Schema = mainSchema;

  get schema() {
    return this.__schema;
  }
}
