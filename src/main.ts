import { LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { NODE_ENV } from './infrastructure/config';

const getLoggerType = (): LogLevel[] => {
  if (NODE_ENV === 'production') {
    return ['warn', 'error', 'log'];
  }

  return ['debug', 'log', 'verbose', 'error', 'warn'];
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter(), {
    logger: getLoggerType(),
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  await app.listen(4000, '0.0.0.0');
}
bootstrap();
