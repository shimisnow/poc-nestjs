import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from '@shared/database/financial/entities/account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthorizationService {
  /** @ignore */
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
  ) {}

  /**
   * Verifies if an user can access an account
   *
   * @param userId User id
   * @param accountId Account id
   * @returns If the user can access the given account
   */
  async userHasAccessToAccount(
    userId: string,
    accountId: number,
  ): Promise<boolean> {
    try {
      const result = await this.accountRepository.findOne({
        where: {
          userId,
          accountId,
        },
      });

      if (result == null) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
