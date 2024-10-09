import { Controller, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ACCESS_CONTROL_SERVICE } from './access-control.constants';
import { IAccessControlService } from './services/access-control.service.interface';

@ApiTags('access-control')
@Controller('access-control')
export class AccessControlController {
  constructor(@Inject(ACCESS_CONTROL_SERVICE) private readonly accessControlService: IAccessControlService) {}

  /* @Get() */
  /* async getUsers() { */
  /*   return this.userService.getUsers(); */
  /* } */
}
