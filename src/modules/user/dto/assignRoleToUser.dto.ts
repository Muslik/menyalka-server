import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { RoleId } from '~/libs/database';

export class AssignRoleToUserDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  roleId: RoleId;
}
