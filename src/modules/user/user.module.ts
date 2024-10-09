import { DynamicModule, FactoryProvider, Module, ModuleMetadata } from '@nestjs/common';

import { IUserServiceOptions } from './interfaces/userServiceOptions.interface';
import { UserRepository } from './repositories/user.repository';
import { UserSocialCredentialsRepository } from './repositories/userSocialCredentialsRepository';
import {
  USER_REPOSITORY,
  USER_SERVICE,
  USER_SERVICE_OPTIONS,
  USER_SOCIAL_CREDENTIALS_REPOSITORY,
} from './user.constants';
import { UserController } from './user.controller';
import { UserService } from './user.service';

interface UserModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: FactoryProvider<IUserServiceOptions>['useFactory'];
  inject?: FactoryProvider['inject'];
}

@Module({
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: USER_SOCIAL_CREDENTIALS_REPOSITORY,
      useClass: UserSocialCredentialsRepository,
    },
    {
      provide: USER_SERVICE,
      useClass: UserService,
    },
  ],
  exports: [USER_SERVICE],
})
export class UserModule {
  static forRootAsync(options: UserModuleAsyncOptions): DynamicModule {
    return {
      module: UserModule,
      imports: options.imports,
      providers: [
        {
          provide: USER_SERVICE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
      ],
      controllers: [UserController],
    };
  }
}
