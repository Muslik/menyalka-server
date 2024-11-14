import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { NODE_ENV, config } from '~/config';

import { AppModule } from './app.module';
import { SESSION_ID } from './config/config.constants';

const { port, host } = config();

const getLoggerType = (): LogLevel[] => {
  if (NODE_ENV === 'production') {
    return ['warn', 'error', 'log'];
  }

  return ['debug', 'log', 'verbose', 'error', 'warn'];
};

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: getLoggerType(),
    bufferLogs: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Menyalka API')
    .setDescription('This api for menyalka app')
    .setVersion('1.0')
    .addTag('auth')
    .addCookieAuth(SESSION_ID, {
      type: 'apiKey',
      name: SESSION_ID,
      in: 'Cookie',
    })
    .build();
  await app.register(fastifyCookie);
  await app.register(fastifyCors, { origin: true, credentials: true });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useLogger(app.get(Logger));
  await app.listen(port, host);
}
bootstrap();
