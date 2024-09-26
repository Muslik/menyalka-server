import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export type UserIdentity = { userAgent: string };

function getUserAgent(request: FastifyRequest): string {
  return request.headers['user-agent'] ?? '';
}

export const UserIdentity = createParamDecorator((_, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<FastifyRequest>();

  return { userAgent: getUserAgent(request) };
});
