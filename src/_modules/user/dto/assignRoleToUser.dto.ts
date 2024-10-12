import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { B } from '~/infrastructure/database';

export class AssignRoleToUserDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  roleId: B.RoleId;
}
