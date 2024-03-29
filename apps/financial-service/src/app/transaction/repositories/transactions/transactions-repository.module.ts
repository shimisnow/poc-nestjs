import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../../../database/entities/transaction.entity';
import { TransactionsRepository } from './transactions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
  providers: [TransactionsRepository],
  exports: [TransactionsRepository],
})
export class TransactionsRepositoryModule {}
