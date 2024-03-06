import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { entities } from './database/entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_USER_HOST,
      port: parseInt(process.env.DATABASE_USER_PORT),
      username: process.env.DATABASE_USER_USERNAME,
      password: process.env.DATABASE_USER_PASSWORD,
      database: process.env.DATABASE_USER_DBNAME,
      entities,
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
