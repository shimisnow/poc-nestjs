import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from '@shared/database/financial/entities/account.entity';
import { AccountStatusEnum } from '@shared/database/financial/enums/account-status.enum';

@Injectable()
export class AccountsRepository {
  constructor(
    @InjectRepository(AccountEntity)
    private repository: Repository<AccountEntity>,
  ) {}

  async accountExists(accountId: number, isActive = false): Promise<boolean> {
    const where = {
      accountId,
    }

    if(isActive) {
      where['status'] = AccountStatusEnum.ACTIVE;
    }

    const result = await this.repository.find({
      select: ['accountId'],
      where,
    });

    return (result?.length > 0);
  }
}
