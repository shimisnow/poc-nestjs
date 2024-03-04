import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceEntity } from '../../database/entities/balance.entity';
import { BalancesRepository } from './balances.repository';
import { TransactionEntity } from '../../database/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BalanceEntity, TransactionEntity])],
  providers: [BalancesRepository],
  exports: [BalancesRepository],
})
export class BalancesRepositoryModule {}
