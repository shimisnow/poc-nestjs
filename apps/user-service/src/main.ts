import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
          dirname: process.env.USER_SERVICE_LOG_DIR,
          filename: `info.${logDate}.log`,
          level: 'info',
        }),
        new winston.transports.File({
          dirname: process.env.USER_SERVICE_LOG_DIR,
          filename: `error.${logDate}.log`,
          level: 'error',
        }),
      ],
    }),
  );
  const port = process.env.USER_SERVICE_PORT || 3000;

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
