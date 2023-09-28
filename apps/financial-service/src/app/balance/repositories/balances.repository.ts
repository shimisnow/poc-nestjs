import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BalanceEntity } from '@shared/database/entities/balance.entity';
import { TransactionEntity } from '@shared/database/entities/transaction.entity';
import { MoreThan, Repository } from 'typeorm';
import { BalanceDifferenceSerializer } from '../serializers/balance-difference.serializer';
import { AccountEntity } from '@shared/database/entities/account.entity';

@Injectable()
export class BalancesRepository {
  constructor(
    @InjectRepository(BalanceEntity)
    private balanceRepository: Repository<BalanceEntity>,

    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
  ) {}

  async getBalance(accountId: number): Promise<number> {
    const result = await this.getActualBalance(accountId);

    if (result === null) {
      throw new NotFoundException('The account does not exist');
    }

    const { balance, lastTransaction } = result;

    // eslint-disable-next-line prefer-const
    let { deltaBalance, maxTransactionId } =
      await this.calculateBalanceDifference(
        accountId,
        lastTransaction.transactionId,
      );

    const newBalance = Number(balance) + Number(deltaBalance);

    // if there is transactions after the actual balance in the database
    if (maxTransactionId !== null) {
      const account = new AccountEntity();
      account.accountId = accountId;

      const transaction = new TransactionEntity();
      transaction.transactionId = maxTransactionId;

      await this.balanceRepository.update(
        { account },
        { balance: newBalance, lastTransaction: transaction },
      );
    }

    return newBalance;
  }

  private async getActualBalance(accountId: number): Promise<BalanceEntity> {
    const account = new AccountEntity();
    account.accountId = accountId;

    return await this.balanceRepository.findOne({
      relations: ['lastTransaction'],
      where: {
        account,
      },
    });
  }

  private async calculateBalanceDifference(
    accountId: number,
    lastTransactionId: number,
  ): Promise<BalanceDifferenceSerializer> {
    const account = new AccountEntity();
    account.accountId = accountId;

    const result = await this.transactionRepository
      .createQueryBuilder()
      .select('sum(amount)', 'deltaBalance')
      .addSelect('max(transaction_id)', 'maxTransactionId')
      .where({ account })
      .andWhere({ transactionId: MoreThan(lastTransactionId) })
      .getRawOne();

    return {
      deltaBalance: result.deltaBalance,
      maxTransactionId: result.maxTransactionId,
    } as BalanceDifferenceSerializer;
  }
}
