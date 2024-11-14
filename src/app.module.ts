import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module, Provider, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { randomUUID } from 'crypto';
import { ClsModule, ClsService } from 'nestjs-cls';
import { LoggerModule, PinoLogger } from 'nestjs-pino';

import { AppConfigModule, AppConfigService, config, CONFIG_SERVICE, configSchema, NODE_ENV } from '~/config';

import { GlobalExceptionFilter } from './libs/app/filters/exception.filter';
import { AuthGuard } from './libs/app/guards/auth.guard';
import { EffectInterceptor } from './libs/app/interceptors/effect.interceptor';
import { ExceptionInterceptor } from './libs/app/interceptors/exception.interceptor';
import { LoggerInterceptor } from './libs/app/interceptors/logger.interceptor';
import { CACHE_STORAGE_NAME, CacheModule } from './libs/cache';
import { DatabaseModule, DATABASE } from './libs/database';
import { TransactionModule } from './libs/database/transaction';
import { ValidationException } from './libs/exceptions';
import { ACCESS_CONTROL_SERVICE, AccessControlModule, AccessControlService } from './modules/access-control';
import { AuthModule } from './modules/auth';
import { RulesModule } from './modules/rules';
import { SessionService, SESSION_SERVICE, SessionModule, SESSIONS_STORAGE_NAME } from './modules/session';
import { TELEGRAM_AUTH_SERVICE, TelegramAuthService, TelegramModule } from './modules/telegram';
import { UserModule, UserService, USER_SERVICE } from './modules/user';

const filters: Provider[] = [
  {
    provide: APP_FILTER,
    useClass: GlobalExceptionFilter,
  },
];

const guards: Provider[] = [
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
];

const pipes = [
  {
    provide: APP_PIPE,
    useFactory: () =>
      new ValidationPipe({
        exceptionFactory: (errors) => {
          const mappedErrors = errors.reduce(
            (acc, { property, constraints }) => {
              if (constraints) {
                Object.keys(constraints).forEach((key) => {
                  acc[`${property}.${key}`] = constraints[key];
                });
              }

              return acc;
            },
            {} as Record<string, string>,
          );

          return new ValidationException(mappedErrors);
        },
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
  {
    provide: APP_INTERCEPTOR,
    useClass: EffectInterceptor,
  },
];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: NODE_ENV === 'production' ? '.env' : `.env.${NODE_ENV}`,
      isGlobal: true,
      load: [config],
      validationSchema: configSchema,
    }),
    AppConfigModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req) => req.headers['X-Request-Id'] ?? randomUUID(),
      },
    }),
    LoggerModule.forRootAsync({
      useFactory: (configService: AppConfigService, cls: ClsService) => ({
        pinoHttp: {
          level: configService.isProduction ? 'info' : 'debug',
          autoLogging: false,
          quietReqLogger: true,
          genReqId: () => cls.getId(),
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
      imports: [AppConfigModule, ClsModule],
    }),
    CacheModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10000,
      },
    ]),
    RedisModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService) => {
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
      imports: [AppConfigModule, LoggerModule],
      useFactory: async (configService: AppConfigService, logger: PinoLogger) => ({
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
      inject: [CONFIG_SERVICE, PinoLogger],
    }),
    TransactionModule.register({
      accessMode: 'read write',
    }),
    AuthModule.forRootAsync({
      imports: [UserModule, TelegramModule, SessionModule, AppConfigModule],
      useFactory: (userService: UserService, telegramService: TelegramAuthService, sessionService: SessionService) => ({
        getUserByUsername: userService.getUserByUsername.bind(userService),
        getUserByProviderId: userService.getUserWithRolesByProviderId.bind(userService),
        createUserWithSocialCredentials: userService.createUserWithSocialCredentials.bind(userService),
        getUserById: userService.getUserWithRolesById.bind(userService),
        telegramValidateAuthData: telegramService.validateAuthData.bind(telegramService),
        createSession: sessionService.createSession.bind(sessionService),
        deleteSession: sessionService.deleteSession.bind(sessionService),
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
    RulesModule,
  ],
  controllers: [],
  providers: [...filters, ...pipes, ...guards, ...interceptors],
})
export class AppModule {}
