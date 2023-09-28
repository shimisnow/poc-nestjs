import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { BalancesRepositoryModule } from './repositories/balances-repository.module';

@Module({
  imports: [BalancesRepositoryModule],
  providers: [BalanceService],
  controllers: [BalanceController],
})
export class BalanceModule {}
