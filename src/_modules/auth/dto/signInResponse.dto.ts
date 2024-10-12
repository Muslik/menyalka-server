import { ApiProperty } from '@nestjs/swagger';

export enum SignInStatus {
  success = 'success',
  needSignUp = 'needSignUp',
}

export class SignInResponseDto {
  @ApiProperty({ example: SignInStatus.success, enum: SignInStatus})
  status: SignInStatus;
}
