import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api/v1';

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

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('app.corsOrigin') || '*',
    credentials: true,
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
