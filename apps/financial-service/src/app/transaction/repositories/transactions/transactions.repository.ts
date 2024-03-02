import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';
import { TransactionTypeEnum } from '@shared/database/financial/enums/transaction-type.enum';
import { AccountEntity } from '@shared/database/financial/entities/account.entity';
import { CreatePairTransactionBody } from './create-pair-transaction.body';
import { CreatePairTransactionResult } from './create-pair-transaction.result';

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private repository: Repository<TransactionEntity>,
  ) {}

  /**
   * Creates two transactions and links each one with the other
   *
   * @param transaction Information about the two transactions that will be stored and linked each one with the other
   * @returns Ids for the created transactions
   */
  /* istanbul ignore next */
  /* ignored at code coverage because it uses database transactions and should not be unit tested */
  async createPairTransaction(
    transaction: CreatePairTransactionBody,
  ): Promise<CreatePairTransactionResult> {
    let resultFrom: TransactionEntity;
    let resultTo: TransactionEntity;
    const queryRunner: QueryRunner =
      this.repository.manager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // create from transaction
      const entityFrom = new TransactionEntity();
      entityFrom.type = transaction.from.type as TransactionTypeEnum;
      entityFrom.amount = transaction.from.amount;
      entityFrom.account = new AccountEntity();
      entityFrom.account.accountId = transaction.from.accountId;

      resultFrom =
        await queryRunner.manager.save<TransactionEntity>(entityFrom);

      // create to transaction
      const entityTo = new TransactionEntity();
      entityTo.type = transaction.to.type as TransactionTypeEnum;
      entityTo.amount = transaction.to.amount;
      entityTo.account = new AccountEntity();
      entityTo.account.accountId = transaction.to.accountId;
      entityTo.transactionPairId = resultFrom.transactionId;

      resultTo = await queryRunner.manager.save<TransactionEntity>(entityTo);

      // update from transaction with the transactionId for from
      const entityFromUpdatePair = new TransactionEntity();
      entityFromUpdatePair.transactionPairId = resultTo.transactionId;

      await queryRunner.manager.update<TransactionEntity>(
        TransactionEntity,
        { transactionId: resultFrom.transactionId },
        entityFromUpdatePair,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      queryRunner.rollbackTransaction();
    } finally {
      queryRunner.release();
    }

    return {
      fromTransactionId: resultFrom.transactionId,
      toTransactionId: resultTo.transactionId,
    } as CreatePairTransactionResult;
  }
}
