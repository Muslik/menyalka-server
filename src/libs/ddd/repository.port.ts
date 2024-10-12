import { Effect, Option } from 'effect';

export class Paginated<T> {
  readonly count: number;
  readonly limit: number;
  readonly page: number;
  readonly data: readonly T[];

  constructor(props: Paginated<T>) {
    this.count = props.count;
    this.limit = props.limit;
    this.page = props.page;
    this.data = props.data;
  }
}

export type OrderBy = { field: true | string; direction: 'asc' | 'desc' };

export type PaginatedQueryParams = {
  limit: number;
  page: number;
  offset: number;
  orderBy: OrderBy;
};

export interface RepositoryPort<Entity> {
  insert(entity: Entity | Entity[]): Effect.Effect<void>;
  findOneById(id: number): Effect.Effect<Option.Option<Entity>>;
  findAll(): Effect.Effect<Entity[]>;
  findAllPaginated(params: PaginatedQueryParams): Effect.Effect<Paginated<Entity>>;
  delete(entity: Entity): Effect.Effect<boolean>;
}
