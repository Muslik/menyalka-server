import { Module } from '@nestjs/common';

import { ACCESS_CONTROL_SERVICE, PERMISSION_REPOSITORY, ROLE_REPOSITORY } from './access-control.constants';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';
import { AccessControlService } from './services/access-control.service';

@Module({
  providers: [
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepository,
    },
    {
      provide: PERMISSION_REPOSITORY,
      useClass: PermissionRepository,
    },
    {
      provide: ACCESS_CONTROL_SERVICE,
      useClass: AccessControlService,
    },
  ],
  exports: [ACCESS_CONTROL_SERVICE],
})
export class AccessControlModule {}
