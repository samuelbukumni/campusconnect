import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api/v1';

  // Automated Database Migration Check on Startup
  try {
    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      logger.log('Database connected successfully. Running pending migrations...');
      const executedMigrations = await dataSource.runMigrations();
      if (executedMigrations.length > 0) {
        logger.log(
          `Successfully executed ${executedMigrations.length} migration(s): ${executedMigrations.map((m) => m.name).join(', ')}`,
        );
      } else {
        logger.log('Database schema is up-to-date. No pending migrations.');
      }
    }
  } catch (err: any) {
    logger.error(`Database migration error on startup: ${err.message}`, err.stack);
  }

  // Set global API route prefix
  app.setGlobalPrefix(apiPrefix);

  // Global Request Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration (allow all origins with credentials & preflight support)
  app.enableCors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  });

  // Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('StudyConnect API')
    .setDescription(
      'RESTful API for The Student Tutoring Application - Peer Tutoring, Study Partners & Material Sharing',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Health', 'Health status check endpoints')
    .addTag('Authentication', 'Student registration, login, and auth tokens')
    .addTag('Users / Students', 'Student profiles, tutoring courses, and discovery')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  logger.log(`=======================================================`);
  logger.log(` StudyConnect API is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(` Swagger API Docs available at: http://localhost:${port}/docs`);
  logger.log(`=======================================================`);
}

bootstrap();
