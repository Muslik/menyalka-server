import { User } from '~/infrastructure/database';

export interface IUserRepository {
  findAll(): Promise<User[]>;
}
