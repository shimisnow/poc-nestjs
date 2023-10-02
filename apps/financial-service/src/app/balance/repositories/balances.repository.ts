import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BalanceEntity } from '@shared/database/financial/entities/balance.entity';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';
import { MoreThan, Repository } from 'typeorm';
import { BalanceDifferenceSerializer } from '../serializers/balance-difference.serializer';
import { AccountEntity } from '@shared/database/financial/entities/account.entity';

@Injectable()
export class BalancesRepository {
  /** @ignore */
  constructor(
    @InjectRepository(BalanceEntity)
    private balanceRepository: Repository<BalanceEntity>,

    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
  ) {}

  /**
   * Calculate the account balance with the actual balance, plus the sum of unprocessed transactions.
   *
   * @param accountId Desired account balance
   * @returns Account balance
   *
   * @throws NotFoundException Account does not exist
   */
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

  /**
   * Retrieves the balance stored at the database
   *
   * @param accountId Desired account balanceId
   * @returns Stored account balance
   */
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

  /**
   * Calculates the balance from unprocessed transactions
   *
   * @param accountId Desired account balanceId
   * @param lastTransactionId Last transaction from the account that was processed to compute the balance
   * @returns Calculated balance and the id from the last processed transaction
   */
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
