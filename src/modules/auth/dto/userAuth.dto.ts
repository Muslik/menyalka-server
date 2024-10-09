import { ApiProperty } from '@nestjs/swagger';

import { RBAC } from '~/infrastructure/config';
import { B } from '~/infrastructure/database';

export class UserAuthDto {
  @ApiProperty({ example: 1 })
  id: B.UserId;

  @ApiProperty({ example: 'johny' })
  username: string;

  @ApiProperty({ enum: RBAC.Permission, example: [RBAC.Permission.AccessControlManage], isArray: true })
  permissions: RBAC.Permission[];

  @ApiProperty({ example: 'lidexuka@yopmail.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: 'John' })
  description: string;

  @ApiProperty({ example: true, nullable: true })
  sex: boolean | null;
}
