import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Option, Effect, pipe } from 'effect';

import { B } from '~/infrastructure/database';

import { UserService } from '../user.service';

@ValidatorConstraint({ async: true })
@Injectable()
class IsEmailFreeConstraint implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(email: string): Promise<boolean> {
    return await pipe(
      this.userService.getUserByEmail(B.Email(email)),
      Effect.map(
        Option.match({
          onSome: () => false,
          onNone: () => true,
        }),
      ),
      Effect.runPromise,
    );
  }

  defaultMessage() {
    return 'Email ($value) is already taken.';
  }
}

export function IsEmailFree(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailFreeConstraint,
    });
  };
}
