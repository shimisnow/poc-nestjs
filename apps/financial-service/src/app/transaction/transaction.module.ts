import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionsRepositoryModule } from './repositories/transactions-repository.module';
import { BalanceModule } from '../balance/balance.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TransactionsRepositoryModule,
    BalanceModule,
    AuthorizationModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
