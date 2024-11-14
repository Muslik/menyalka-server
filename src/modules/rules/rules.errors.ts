import { ExceptionCodes, NotFoundException } from '~/libs/exceptions';

export class FileNotFoundError extends NotFoundException {
  _tag = ExceptionCodes.FILE_NOT_FOUND;
  constructor() {
    super('File not found');
  }
}
