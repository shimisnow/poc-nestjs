import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionsRepositoryModule } from './repositories/transactions-repository.module';
import { BalanceModule } from '../balance/balance.module';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  imports: [TransactionsRepositoryModule, BalanceModule, AuthorizationModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
