import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { entities } from './database/entities';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_AUTH_HOST,
      port: parseInt(process.env.DATABASE_AUTH_PORT),
      username: process.env.DATABASE_AUTH_USERNAME,
      password: process.env.DATABASE_AUTH_PASSWORD,
      database: process.env.DATABASE_AUTH_DBNAME,
      entities,
      synchronize: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
    JwtModule.register({
      global: true,
    }),
  ],
})
export class AppModule {}
