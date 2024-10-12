import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module, Provider, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule, PinoLogger } from 'nestjs-pino';
import { v4 as uuid } from 'uuid';

import { CONFIG_SERVICE, ConfigModule, ConfigService } from '~/infrastructure/config';
import { DatabaseModule, DATABASE, TransactionalAdapterDrizzle } from '~/infrastructure/database';
import { BadRequestException } from '~/infrastructure/exceptions';
import { GlobalExceptionFilter } from '~/infrastructure/filters/exception.filter';
import { ExceptionInterceptor } from '~/infrastructure/interceptors/exception.interceptor';
import { LoggerInterceptor } from '~/infrastructure/interceptors/logger.interceptor';

import { CACHE_STORAGE_NAME, CacheModule } from './infrastructure/cache';
import { ACCESS_CONTROL_SERVICE, AccessControlModule, AccessControlService } from './_modules/access-control';
import { AuthModule } from './_modules/auth';
import { SESSION_SERVICE, SessionModule, SESSIONS_STORAGE_NAME } from './_modules/session';
import { SessionService } from './_modules/session/session.service';
import { TELEGRAM_AUTH_SERVICE, TelegramAuthService, TelegramModule } from './_modules/telegram';
import { UserModule, UserService } from './_modules/user';
import { USER_SERVICE } from './_modules/user/user.constants';
import { ClsPluginTransactional } from '~/infrastructure/lib/effect/plugin-transactional';

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
    ConfigModule.forRoot(),
    CacheModule,
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
      inject: [CONFIG_SERVICE],
      imports: [ConfigModule],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10000,
      },
    ]),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      plugins: [
        new ClsPluginTransactional({
          imports: [DatabaseModule],
          adapter: new TransactionalAdapterDrizzle(DATABASE, { accessMode: 'read write' }),
        }),
      ],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          config: [
            {
              namespace: SESSIONS_STORAGE_NAME,
              url: `${configService.redis.url}/${configService.redis.sessionDatabase}`,
            },
            {
              namespace: CACHE_STORAGE_NAME,
              url: `${configService.redis.url}/${configService.redis.cacheDatabase}`,
            },
          ],
        };
      },
      inject: [CONFIG_SERVICE],
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
                /* logger.debug(parameters, 'Parameters'); */
              }
            },
          },
        },
      }),
      inject: [CONFIG_SERVICE, PinoLogger],
    }),
    AuthModule.forRootAsync({
      imports: [UserModule, TelegramModule, SessionModule],
      useFactory: (userService: UserService, telegramService: TelegramAuthService, sessionService: SessionService) => ({
        getUserByProviderId: userService.getUserByProviderId,
        createUserWithSocialCredentials: userService.createUserWithSocialCredentials,
        getUserById: userService.getUserWithRolesById,
        telegramValidateAuthData: telegramService.validateAuthData,
        createSession: sessionService.createSession,
      }),
      inject: [USER_SERVICE, TELEGRAM_AUTH_SERVICE, SESSION_SERVICE],
    }),
    UserModule.forRootAsync({
      imports: [AccessControlModule],
      useFactory: (accessControlService: AccessControlService) => ({
        getRoleById: accessControlService.getRoleById,
      }),
      inject: [ACCESS_CONTROL_SERVICE],
    }),
    SessionModule,
    AccessControlModule,
    TelegramModule,
  ],
  controllers: [],
  providers: [...filters, ...guards, ...pipes, ...interceptors],
})
export class AppModule { }
