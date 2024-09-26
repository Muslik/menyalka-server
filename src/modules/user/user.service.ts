import { Inject, Injectable } from '@nestjs/common';

import { User } from '~/infrastructure/database';

import { USER_REPOSITORY } from './user.constants';
import { IUserRepository } from './user.repository.interface';
import { IUserService } from './user.service.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async getUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
