/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';
import { TransactionsRepository } from './repositories/transactions.repository';
import { TransactionService } from './transaction.service';
import { TransactionTypeEnum } from '@shared/database/financial/enums/transaction-type.enum';
import { NotFoundException } from '@nestjs/common';

describe('TransactionController', () => {
  let controller: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        TransactionService,
        TransactionsRepository,
        {
          provide: CACHE_MANAGER,
          useValue: {
            del: (key) => {},
          },
        },
        {
          provide: getRepositoryToken(TransactionEntity),
          useValue: {
            save: (entity: TransactionEntity) => {
              switch (entity.account.accountId) {
                case 1234:
                  entity.transactionId = 42;
                  return entity;
                default:
                  throw new Error('insert or update on table error');
              }
            },
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('transaction.controller -> createTransaction()', () => {
    test('account does not exists', async () => {
      try {
        await controller.createTransaction({
          accountId: 9876,
          type: TransactionTypeEnum.DEBIT,
          amount: 1200,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    test('transaction created without errors', async () => {
      const result = await controller.createTransaction({
        accountId: 1234,
        type: TransactionTypeEnum.DEBIT,
        amount: 1200,
      });

      expect(result).toHaveProperty('transactionId');
      expect(result.transactionId).toBe(42);
    });
  });
});
