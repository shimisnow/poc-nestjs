import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceEntity } from '@shared/database/financial/entities/balance.entity';
import { BalancesRepository } from './balances.repository';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BalanceEntity, TransactionEntity])],
  providers: [BalancesRepository],
  exports: [BalancesRepository],
})
export class BalancesRepositoryModule {}
