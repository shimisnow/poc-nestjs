import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { TransactionModule } from './transaction/transaction.module';
import { BalanceModule } from './balance/balance.module';
import { DatabaseModule } from './database/database.module';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    DatabaseModule,
    CacheModule.registerAsync({
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
