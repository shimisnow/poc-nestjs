import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from '@shared/database/financial/entities/account.entity';
import { AccountStatusEnum } from '@shared/database/financial/enums/account-status.enum';

@Injectable()
export class AccountsRepository {
  /** ignore */
  constructor(
    @InjectRepository(AccountEntity)
    private repository: Repository<AccountEntity>,
  ) {}

  /**
   * Verifies if an account exists and is active
   *
   * @param accountId Account to be verified
   * @param isActive Defines if the account needs to be active to return true if exists
   * @returns If the account exists (and is active in some cases)
   */
  async accountExists(accountId: number, isActive = false): Promise<boolean> {
    const where = {
      accountId,
    };

    // verifies if the account is also active
    if (isActive) {
      where['status'] = AccountStatusEnum.ACTIVE;
    }

    const result = await this.repository.find({
      select: ['accountId'],
      where,
    });

    return result?.length > 0;
  }
}
