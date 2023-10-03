import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { BalancesRepositoryModule } from './repositories/balances-repository.module';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  imports: [BalancesRepositoryModule, AuthorizationModule],
  providers: [BalanceService],
  controllers: [BalanceController],
  exports: [BalanceService],
})
export class BalanceModule {}
