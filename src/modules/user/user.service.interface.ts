import { User } from '~/infrastructure/database';

export interface IUserService {
  getUsers(): Promise<User[]>;
}
