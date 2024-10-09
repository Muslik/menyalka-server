import { NotAllowedException } from '~/infrastructure/exceptions';

enum AccessControlExceptionCodes {
  Read = 'ACCESS_CONTROL.READ',
}

export class ReadOnlyRoleError extends NotAllowedException {
  constructor() {
    super(AccessControlExceptionCodes.Read, 'Read only role');
  }
}
