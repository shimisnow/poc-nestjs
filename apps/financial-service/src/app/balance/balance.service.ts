import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { BalancesRepository } from './repositories/balances.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserService } from '../user/user.service';
import { CachedBalanceSerializer } from './serializers/cached-balance.serializer';
import { GetBalanceSerializer } from './serializers/get-balance.serializer';

@Injectable()
export class BalanceService {
  /** @ignore */
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private balancesRepository: BalancesRepository,
    private userService: UserService,
  ) {}

  /**
   * Get the account balance FROM CACHE if it exists. If not, calculate and retrieve it from database.
   *
   * @param accountId Desired account balance
   * @param userId Account owner. Used to verify ownership
   * 
   * @throws ForbiddenException User has no ownership of the account or account does not exists
   * 
   * @returns Account balance and a flag for value from cache
   */
  async getBalance(accountId: number, userId: string): Promise<GetBalanceSerializer> {
    const hasAccess = await this.userService.hasAccessToAccount(
      userId,
      accountId,
    );

    if (hasAccess == false) {
      throw new ForbiddenException();
    }

    const cacheKey = `balance-acc-${accountId}`;

    const cachedData =
      await this.cacheService.get<CachedBalanceSerializer>(cacheKey);

    if (cachedData !== null) {
      return {
        balance: cachedData.balance,
        cached: true,
      };
    }

    const calculatedBalance =
      await this.balancesRepository.getBalance(accountId);

    await this.cacheService.set(cacheKey, {
      balance: calculatedBalance,
      updateAt: new Date(),
    });

    return {
      balance: calculatedBalance,
      cached: false,
    };
  }

  /**
   * Get the account balance FROM DATABASE ignoring the value stored in cache
   *
   * @param accountId Desired account balance
   * @param userId Account owner. Used to verify ownership
   * 
   * @throws ForbiddenException User has no ownership of the account or account does not exists
   * 
   * @returns Account balance
   */
  async getBalanceIgnoringCache(accountId: number, userId: string): Promise<number> {
    const hasAccess = await this.userService.hasAccessToAccount(
      userId,
      accountId,
    );

    if (hasAccess == false) {
      throw new ForbiddenException();
    }

    const calculatedBalance =
      await this.balancesRepository.getBalance(accountId);

    return calculatedBalance;
  }
}
