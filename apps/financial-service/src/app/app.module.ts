import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { JwtModule } from '@nestjs/jwt';
import { TransactionModule } from './transaction/transaction.module';
import { BalanceModule } from './balance/balance.module';
import { DatabaseModule } from './database/database.module';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
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
      secret: process.env.JWT_SECRET_KEY,
    }),
    TransactionModule,
    BalanceModule,
  ],
})
export class AppModule {}
