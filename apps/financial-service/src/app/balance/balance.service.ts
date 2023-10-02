import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { BalancesRepository } from './repositories/balances.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CachedBalanceSerializer } from './serializers/cached-balance.serializer';

@Injectable()
export class BalanceService {
  /** @ignore */
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private balancesRepository: BalancesRepository,
  ) {}

  /**
   * Get the account balance FROM CACHE if it exists. If not, calculate and retrieve it from database.
   *
   * @param accountId Desired account balance
   * @returns Account balance
   */
  async getBalance(accountId: number): Promise<number> {
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

  /**
   * Get the account balance FROM DATABASE ignoring the value stored in cache
   *
   * @param accountId Desired account balance
   * @returns Account balance
   */
  async getBalanceIgnoringCache(accountId: number): Promise<number> {
    const calculatedBalance =
      await this.balancesRepository.getBalance(accountId);

    return calculatedBalance;
  }
}
