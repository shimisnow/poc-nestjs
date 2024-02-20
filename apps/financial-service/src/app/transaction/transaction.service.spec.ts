/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TransactionService } from './transaction.service';
import { TransactionsRepository } from './repositories/transactions/transactions.repository';
import { BalanceService } from '../balance/balance.service';
import { AccountsRepository } from './repositories/accounts/accounts.repository';
import { TransactionTypeEnum } from '@shared/database/financial/enums/transaction-type.enum';
import { ForbiddenException, PreconditionFailedException } from '@nestjs/common';
import { CreatePairTransactionBody } from './repositories/transactions/create-pair-transaction.body';
import { CreatePairTransactionResult } from './repositories/transactions/create-pair-transaction.result';

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: AccountsRepository,
          useValue: {
            accountExists: (accountId: number, isActive = false): boolean => {
              let status = true;

              switch(accountId) {
                case 1:
                  status = false;
                  break;
                case 2:
                  status = true;
                  break;
                case 3:
                  status = false;
                  break;
              }

              return status;
            }
          },
        },
        {
          provide: BalanceService,
          useValue: {
            getBalanceIgnoringCache: (accountId: number, userId: string): number => {
              let balance = 0;

              switch (accountId) {
                case 5:
                  balance = 1000;
                  break;
              }

              return balance;
            }
          }
        },
        {
          provide: TransactionsRepository,
          useValue: {
            createPairTransaction: (transaction: CreatePairTransactionBody): CreatePairTransactionResult => {
              return {
                fromTransactionId: 1234,
                toTransactionId: 5678,
              };
            }
          }
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            del: (key) => {},
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transaction.service -> createDebitTransaction()', () => {
    describe('transaction type errors', () => {
      test('transaction type is not a debit', async () => {
        try {
          await service.createDebitTransaction('', {
            accountId: 0,
            pairAccountId: 0,
            type: TransactionTypeEnum.CREDIT,
            amount: 0,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(PreconditionFailedException);
          expect(error.response.data.name).toBe('InvalidTransactionType');
          expect(error.response.data.errors).toEqual(expect.arrayContaining(['only debit transaction type allowed']));
        }
      });
    });

    describe('account errors', () => {
      test('accountId does not exist or is inactive', async () => {
        try {
          await service.createDebitTransaction('', {
            accountId: 1,
            pairAccountId: 2,
            type: TransactionTypeEnum.DEBIT,
            amount: 0,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(ForbiddenException);
          expect(error.response.data.name).toBe('InexistentOrInactiveAccount');
          expect(error.response.data.errors).toEqual(expect.arrayContaining(['accountId does not exists or it is inactive']));
          expect(error.response.data.errors).toEqual(expect.not.arrayContaining(['pairAccountId does not exists or it is inactive']));
        }
      });

      test('pairAccountId does not exist or is inactive', async () => {
        try {
          await service.createDebitTransaction('', {
            accountId: 2,
            pairAccountId: 1,
            type: TransactionTypeEnum.DEBIT,
            amount: 0,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(ForbiddenException);
          expect(error.response.data.name).toBe('InexistentOrInactiveAccount');
          expect(error.response.data.errors).toEqual(expect.not.arrayContaining(['accountId does not exists or it is inactive']));
          expect(error.response.data.errors).toEqual(expect.arrayContaining(['pairAccountId does not exists or it is inactive']));
        }
      });

      test('accountId and pairAccountId does not exist or is inactive', async () => {
        try {
          await service.createDebitTransaction('', {
            accountId: 1,
            pairAccountId: 3,
            type: TransactionTypeEnum.DEBIT,
            amount: 0,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(ForbiddenException);
          expect(error.response.data.name).toBe('InexistentOrInactiveAccount');
          expect(error.response.data.errors).toEqual(expect.arrayContaining(['accountId does not exists or it is inactive']));
          expect(error.response.data.errors).toEqual(expect.arrayContaining(['pairAccountId does not exists or it is inactive']));
        }
      });
    });

    describe('balance errors', () => {
      test('accountId has insufficient balance', async () => {
        try {
          await service.createDebitTransaction('', {
            accountId: 4,
            pairAccountId: 5,
            type: TransactionTypeEnum.DEBIT,
            amount: -200,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(PreconditionFailedException);
          expect(error.response.data.name).toBe('InsufficientAccountBalance');
          expect(error.response.data).not.toHaveProperty('errors');
        }
      });
    });

    describe('successful transactions', () => {
      test('transaction created without errors', async () => {
        const result = await service.createDebitTransaction('', {
          accountId: 5,
          pairAccountId: 6,
          type: TransactionTypeEnum.DEBIT,
          amount: -200,
        });

        expect(result).toHaveProperty('fromTransactionId');
        expect(result).toHaveProperty('toTransactionId');
        expect(result.fromTransactionId).toBe(1234);
        expect(result.toTransactionId).toBe(5678);
      });
    });
  });

});