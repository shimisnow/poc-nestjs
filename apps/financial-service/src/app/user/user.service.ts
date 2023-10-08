import { Injectable } from '@nestjs/common';
import { AccountsRepository } from './repositories/accounts/accounts.repository';

@Injectable()
export class UserService {
  /** @ignore */
  constructor(private accountsRepository: AccountsRepository) {}

  /**
   * Verifies if an user can access an account
   *
   * @param userId User id
   * @param accountId Account id
   * @returns If the user can access the given account
   */
  async hasAccessToAccount(
    userId: string,
    accountId: number,
  ): Promise<boolean> {
    try {
      const result = await this.accountsRepository.findByUserAndAccount(
        userId,
        accountId,
      );

      if (result == null) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
