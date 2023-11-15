import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from '@shared/database/financial/entities/account.entity';

@Injectable()
export class AccountsRepository {
  /** @ignore */
  constructor(
    @InjectRepository(AccountEntity)
    private accountsRepository: Repository<AccountEntity>,
  ) {}

  async findByUserAndAccount(
    userId: string,
    accountId: number,
  ): Promise<AccountEntity> {
    return await this.accountsRepository.findOne({
      where: {
        userId,
        accountId,
      },
    });
  }
}
