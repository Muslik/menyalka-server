import { ApiProperty } from '@nestjs/swagger';

import { ExceptionCodes, ForbiddenException } from '~/libs/exceptions';

export class ReadOnlyRoleError extends ForbiddenException {
  @ApiProperty({ enum: [ExceptionCodes.ACCESS_CONTROL_READ_ONLY], name: 'code' })
  _tag = ExceptionCodes.ACCESS_CONTROL_READ_ONLY;
  constructor() {
    super('Read only role');
  }
}
