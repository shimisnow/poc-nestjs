import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    /* CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }), */
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          stores: [
            new KeyvRedis(
              `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
            ),
          ],
        };
      },
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
    }),
  ],
})
export class AppModule {}
