import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BalanceEntity } from '@shared/database/entities/balance.entity';
import { TransactionEntity } from '@shared/database/entities/transaction.entity';
import { MoreThan, Repository } from 'typeorm';
import { BalanceDifferenceSerializer } from '../serializers/balance-difference.serializer';

@Injectable()
export class BalancesRepository {
  constructor(
    @InjectRepository(BalanceEntity)
    private balanceRepository: Repository<BalanceEntity>,

    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
  ) {}

  async getBalance(accountId: number): Promise<number> {
    const { balance, lastTransactionId } =
      await this.getActualBalance(accountId);

    // eslint-disable-next-line prefer-const
    let { deltaBalance, maxTransactionId } =
      await this.calculateBalanceDifference(accountId, lastTransactionId);

    const newBalance = Number(balance) + Number(deltaBalance);

    // if there is transactions after the actual balance in the database
    if (maxTransactionId !== null) {
      await this.balanceRepository.update(
        { accountId },
        { balance: newBalance, lastTransactionId: maxTransactionId },
      );
    }

    return newBalance;
  }

  private async getActualBalance(accountId: number): Promise<BalanceEntity> {
    return await this.balanceRepository.findOne({
      select: ['balance', 'lastTransactionId'],
      where: {
        accountId,
      },
    });
  }

  private async calculateBalanceDifference(
    accountId: number,
    lastTransactionId: number,
  ): Promise<BalanceDifferenceSerializer> {
    const result = await this.transactionRepository
      .createQueryBuilder()
      .select('sum(amount)', 'deltaBalance')
      .addSelect('max(transaction_id)', 'maxTransactionId')
      .where({ accountId })
      .andWhere({ transactionId: MoreThan(lastTransactionId) })
      .getRawOne();

    return {
      deltaBalance: result.deltaBalance,
      maxTransactionId: result.maxTransactionId,
    } as BalanceDifferenceSerializer;
  }
}
