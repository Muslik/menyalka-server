import { ClsServiceManager } from 'nestjs-cls';

export class AppRequestContext {
  static getRequestId(): string {
    return ClsServiceManager.getClsService().getId();
  }
}
