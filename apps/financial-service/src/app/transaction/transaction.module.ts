import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionsRepositoryModule } from './repositories/transactions-repository.module';
import { BalanceModule } from '../balance/balance.module';
import { UserModule } from '../user/user.module';
import { AccountsRepositoryModule } from './repositories/accounts/accounts-repository.module';

@Module({
  imports: [
    AccountsRepositoryModule,
    TransactionsRepositoryModule,
    BalanceModule,
    UserModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
