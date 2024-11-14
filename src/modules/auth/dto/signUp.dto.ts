import { ApiProperty } from '@nestjs/swagger';
import { SchemaObjectMetadata } from '@nestjs/swagger/dist/interfaces/schema-object-metadata.interface';
import { IsString, MaxLength, Matches, MinLength, MAX_LENGTH, MIN_LENGTH, MATCHES } from 'class-validator';

import { ValidationException } from '~/libs/exceptions';

const MAX_USERNAME_LENGTH = 50;
const MIN_USERNAME_LENGTH = 3;

type Constraints = BuildConstraints<'username', [typeof MAX_LENGTH, typeof MIN_LENGTH, typeof MATCHES]>;

export class SignUpDtoValidationResponse extends ValidationException {
  @ApiProperty({
    type: 'object',
    properties: {
      [`username.${MAX_LENGTH}`]: { type: 'string' },
      [`username.${MIN_LENGTH}`]: { type: 'string' },
      [`username.${MATCHES}`]: { type: 'string' },
    } satisfies Record<keyof Constraints, SchemaObjectMetadata>,
  })
  readonly constraints: Constraints;
}

export class SignUpDto {
  @ApiProperty({ example: '@Dzhabb', type: String, minLength: MIN_USERNAME_LENGTH, maxLength: MAX_USERNAME_LENGTH })
  @IsString()
  @MinLength(MIN_USERNAME_LENGTH)
  @MaxLength(MAX_USERNAME_LENGTH)
  @Matches(/^[a-zA-Z0-9_-]+$/)
  username: string;
}
