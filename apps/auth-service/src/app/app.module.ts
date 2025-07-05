import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [
            createKeyv(
              `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
            ).on('error', (err: Error) => {
              console.log(`Keyv Redis Connection Error: ${err.message}`);
            }),
          ],
        };
      },
    }),
    JwtModule.register({
      global: true,
    }),
  ],
})
export class AppModule {}
