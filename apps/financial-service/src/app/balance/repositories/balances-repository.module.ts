import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceEntity } from '@shared/database/entities/balance.entity';
import { BalancesRepository } from './balances.repository';
import { TransactionEntity } from '@shared/database/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BalanceEntity, TransactionEntity])],
  providers: [BalancesRepository],
  exports: [BalancesRepository],
})
export class BalancesRepositoryModule {}
