import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { mkdirSync, writeFileSync } from 'fs';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /* app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  ); */
  const port = process.env.FINANCIAL_SERVICE_PORT || 3000;

  if (process.env.FINANCIAL_SERVICE_BUILD_OPENAPI === 'true') {
    const config = new DocumentBuilder().setTitle('Financial Service').build();
    const document = SwaggerModule.createDocument(app, config);

    await mkdirSync('apps/financial-service/docs/openapi/', {
      recursive: true,
    });
    await writeFileSync(
      'apps/financial-service/docs/openapi/openapi-docs.json',
      JSON.stringify(document),
      { encoding: 'utf8' }
    );
  }

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
