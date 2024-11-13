import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionsRepositoryModule } from './repositories/transactions/transactions-repository.module';
import { BalanceModule } from '../balance/balance.module';
import { UserModule } from '../user/user.module';
import { AccountsRepositoryModule } from './repositories/accounts/accounts-repository.module';
import { AuthGuardModule } from '@shared/authentication/guards/auth-guard.module';

@Module({
  imports: [
    AccountsRepositoryModule,
    TransactionsRepositoryModule,
    BalanceModule,
    UserModule,
    AuthGuardModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
