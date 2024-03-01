import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { mkdirSync, writeFileSync } from 'fs';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableVersioning({
    type: VersioningType.HEADER,
    header: 'X-Api-Version',
    defaultVersion: '1',
  });
  // docs at https://github.com/gremo/nest-winston/blob/main/README.md
  const logDate = new Date().toLocaleDateString('en-ca').replace(/-/g, '');
  app.useLogger(
    WinstonModule.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({
          dirname: process.env.AUTH_SERVICE_LOG_DIR,
          filename: `info.${logDate}.log`,
          level: 'info',
        }),
        new winston.transports.File({
          dirname: process.env.AUTH_SERVICE_LOG_DIR,
          filename: `error.${logDate}.log`,
          level: 'error',
        }),
      ],
    }),
  );
  const port = process.env.AUTH_SERVICE_PORT || 3000;

  if (process.env.AUTH_SERVICE_BUILD_OPENAPI === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Auth Service')
      .addBearerAuth(
        {
          description:
            'accessToken provided by the login, refresh, or password endpoint',
          in: 'header',
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'AccessToken',
      )
      .addBearerAuth(
        {
          description:
            'refreshToken provided by the login, or password endpoint',
          in: 'header',
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'RefreshToken',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);

    await mkdirSync('apps/auth-service/docs/openapi/', { recursive: true });
    await writeFileSync(
      'apps/auth-service/docs/openapi/openapi-docs.json',
      JSON.stringify(document),
      { encoding: 'utf8' },
    );
  }

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
