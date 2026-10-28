import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';

import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { InitialSchema1730000000000 } from './database/migrations/1730000000000-InitialSchema';
import { AddGenderToUsers1730000000001 } from './database/migrations/1730000000001-AddGenderToUsers';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { TutoringModule } from './modules/tutoring/tutoring.module';
import { PartnersModule } from './modules/partners/partners.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    // Configuration Module (loads .env globally)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: ['.env'],
    }),

    // Rate Limiting (Throttler)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30, // 30 requests per minute default across endpoints
      },
    ]),

    // Database Connection via TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('database.url');
        const useSsl = configService.get('database.ssl');

        return {
          type: 'postgres',
          ...(dbUrl
            ? { url: dbUrl }
            : {
                host: configService.get<string>('database.host'),
                port: configService.get<number>('database.port'),
                username: configService.get<string>('database.username'),
                password: configService.get<string>('database.password'),
                database: configService.get<string>('database.database'),
              }),
          autoLoadEntities: true,
          synchronize: false,
          migrationsRun: true,
          migrations: [InitialSchema1730000000000, AddGenderToUsers1730000000001],
          logging: configService.get<boolean>('database.logging'),
          ssl: useSsl,
        };
      },
      inject: [ConfigService],
    }),

    // Feature Modules (Attendance removed per team spec)
    AuthModule,
    UsersModule,
    CoursesModule,
    TutoringModule,
    PartnersModule,
    MaterialsModule,
    ReviewsModule,
    ReportsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
