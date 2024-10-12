import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Option, Effect, pipe } from 'effect';

import { B } from '~/infrastructure/database';

import { UserService } from '../user.service';

@ValidatorConstraint({ async: true })
@Injectable()
class IsUsernameFreeConstraint implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(username: string): Promise<boolean> {
    return await pipe(
      this.userService.getUserByUsername(B.Username(username)),
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
    return 'Username ($value) is already taken.';
  }
}

export function IsUsernameFree(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameFreeConstraint,
    });
  };
}
