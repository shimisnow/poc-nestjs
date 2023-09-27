import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountEntity } from '@shared/database/entities/account.entity';
import { BalanceEntity } from '@shared/database/entities/balance.entity';
import { TransactionEntity } from '@shared/database/entities/transaction.entity';
import { TransactionModule } from './transaction/transaction.module';
import { BalanceModule } from './balance/balance.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_FINANCIAL_HOST,
      port: parseInt(process.env.DATABASE_FINANCIAL_PORT),
      username: process.env.DATABASE_FINANCIAL_USERNAME,
      password: process.env.DATABASE_FINANCIAL_PASSWORD,
      database: process.env.DATABASE_FINANCIAL_DBNAME,
      synchronize: true,
      entities: [AccountEntity, BalanceEntity, TransactionEntity],
    }),
    TransactionModule,
    BalanceModule,
  ],
})
export class AppModule {}
