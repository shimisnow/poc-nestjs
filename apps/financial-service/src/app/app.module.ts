import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { JwtModule } from '@nestjs/jwt';
import { AccountEntity } from '@shared/database/financial/entities/account.entity';
import { BalanceEntity } from '@shared/database/financial/entities/balance.entity';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';
import { TransactionModule } from './transaction/transaction.module';
import { BalanceModule } from './balance/balance.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_FINANCIAL_HOST,
      port: parseInt(process.env.DATABASE_FINANCIAL_PORT),
      username: process.env.DATABASE_FINANCIAL_USERNAME,
      password: process.env.DATABASE_FINANCIAL_PASSWORD,
      database: process.env.DATABASE_FINANCIAL_DBNAME,
      entities: [AccountEntity, BalanceEntity, TransactionEntity],
      logging: true,
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
