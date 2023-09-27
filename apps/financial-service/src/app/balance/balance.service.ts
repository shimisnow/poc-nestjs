import { Injectable } from '@nestjs/common';
import { BalancesRepository } from './repositories/balances.repository';

@Injectable()
export class BalanceService {
  constructor(private balancesRepository: BalancesRepository) {}

  async getBalance(accountId: number) {
    return this.balancesRepository.getBalance(accountId);
  }
}
