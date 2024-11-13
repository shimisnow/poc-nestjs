import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { BalancesRepositoryModule } from './repositories/balances-repository.module';
import { UserModule } from '../user/user.module';
import { AuthGuardModule } from '@shared/authentication/guards/auth-guard.module';

@Module({
  imports: [BalancesRepositoryModule, UserModule, AuthGuardModule],
  providers: [BalanceService],
  controllers: [BalanceController],
  exports: [BalanceService],
})
export class BalanceModule {}
