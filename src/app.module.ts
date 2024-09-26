import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { Module, Provider, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule, PinoLogger } from 'nestjs-pino';
import { v4 as uuid } from 'uuid';

import { ConfigModule, ConfigService } from '~/infrastructure/config';
import { DatabaseModule, DATABASE, TransactionalAdapterDrizzle } from '~/infrastructure/database';
import { BadRequestException } from '~/infrastructure/exceptions';
import { GlobalExceptionFilter } from '~/infrastructure/filters/exception.filter';
import { ExceptionInterceptor } from '~/infrastructure/interceptors/exception.interceptor';
import { LoggerInterceptor } from '~/infrastructure/interceptors/logger.interceptor';

import { UserModule } from './modules/user';

const filters: Provider[] = [
  {
    provide: APP_FILTER,
    useClass: GlobalExceptionFilter,
  },
];

const guards: Provider[] = [];
const pipes = [
  {
    provide: APP_PIPE,
    useFactory: () =>
      new ValidationPipe({
        exceptionFactory: (errors) =>
          new BadRequestException(
            'VALIDATION_ERROR',
            'Ошибка валидации данных',
            Object.fromEntries(
              errors.map((error): [string, Record<string, string>] => [error.property, error.constraints || {}]),
            ),
          ),
      }),
  },
];
const interceptors: Provider[] = [
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggerInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ExceptionInterceptor,
  },
];

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.isProduction ? 'info' : 'debug',
          autoLogging: false,
          quietReqLogger: true,
          genReqId: (req) => {
            return (req.headers['X-Request-Id'] as string) || uuid();
          },
          customProps: () => ({
            context: 'HTTP',
          }),
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
            },
          },
        },
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10000,
      },
    ]),
    ConfigModule.forRoot(),
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [DatabaseModule],
          adapter: new TransactionalAdapterDrizzle(DATABASE, { accessMode: 'read write' }),
        }),
      ],
    }),
    DatabaseModule.registerAsync({
      tag: DATABASE,
      imports: [ConfigModule, LoggerModule],
      useFactory: async (configService: ConfigService, logger: PinoLogger) => ({
        postgres: {
          url: configService.database.url,
          config: {
            debug: (_, query, parameters) => {
              if (configService.isDevelopment) {
                logger.setContext('Postgres');
                logger.debug(query, 'Executing query');
                logger.debug(parameters, 'Parameters');
              }
            },
          },
        },
      }),
      inject: [ConfigService, PinoLogger],
    }),
    UserModule,
  ],
  controllers: [],
  providers: [...filters, ...guards, ...pipes, ...interceptors],
})
export class AppModule {}
