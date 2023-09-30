import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { BalancesRepository } from './repositories/balances.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CachedBalanceSerializer } from './serializers/cached-balance.serializer';

@Injectable()
export class BalanceService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private balancesRepository: BalancesRepository,
  ) {}

  async getBalance(accountId: number) {
    const cacheKey = `balance-acc-${accountId}`;

    const cachedData =
      await this.cacheService.get<CachedBalanceSerializer>(cacheKey);

    if (cachedData !== null) {
      return cachedData.balance;
    }

    const calculatedBalance =
      await this.balancesRepository.getBalance(accountId);

    await this.cacheService.set(cacheKey, {
      balance: calculatedBalance,
      updateAt: new Date(),
    });

    return calculatedBalance;
  }
}
