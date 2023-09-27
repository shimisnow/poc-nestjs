import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionsRepositoryModule } from './repositories/transactions-repository.module';

@Module({
  imports: [TransactionsRepositoryModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
