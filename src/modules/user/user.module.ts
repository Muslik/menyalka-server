import { Module } from '@nestjs/common';

import { USER_REPOSITORY, USER_SERVICE } from './user.constants';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: USER_SERVICE,
      useClass: UserService,
    },
  ],
  controllers: [UserController],
  exports: [USER_SERVICE],
})
export class UserModule {}
