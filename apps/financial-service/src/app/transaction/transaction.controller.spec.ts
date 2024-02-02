/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';
import { TransactionsRepository } from './repositories/transactions.repository';
import { TransactionService } from './transaction.service';
import { TransactionTypeEnum } from '@shared/database/financial/enums/transaction-type.enum';
import {
  ForbiddenException,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { BalanceService } from '../balance/balance.service';
import { BalancesRepository } from '../balance/repositories/balances.repository';
import { AuthGuard } from '@shared/authentication/guards/auth.guard';
import { UserPayload } from '@shared/authentication/payloads/user.payload';
import { UserService } from '../user/user.service';
import { BalanceEntity } from '@shared/database/financial/entities/balance.entity';

describe('TransactionController', () => {
  let controller: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        TransactionService,
        TransactionsRepository,
        {
          provide: UserService,
          useValue: {
            hasAccessToAccount: (userId: string, accountId: number) => {
              switch (userId) {
                case '10f88251-d181-4255-92ed-d0d874e3a166':
                  switch (accountId) {
                    case 1234:
                    case 2345:
                      return true;
                    default:
                      return false;
                  }
                default:
                  return true;
              }
            },
          },
        },
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
        {
          provide: BalanceService,
          useValue: {
            getBalanceIgnoringCache: (accountId: number, userId: string) => {
              switch (userId) {
                case '10f88251-d181-4255-92ed-d0d874e3a166':
                  switch (accountId) {
                    case 1234:
                      return 2000;
                    case 2345:
                      return 100;
                  }
                }
              throw new ForbiddenException();
            },
          },
        },
        {
          provide: BalancesRepository,
          useValue: {},
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /* describe('transaction.controller -> createTransaction()', () => {
    const user: UserPayload = {
      userId: '10f88251-d181-4255-92ed-d0d874e3a166',
      iat: 1696354363,
      exp: 1917279163,
    };

    test('user has no access to the account', async () => {
      try {
        await controller.createTransaction(user, {
          accountId: 4242,
          type: TransactionTypeEnum.DEBIT,
          amount: 1200,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });

    test('account does not exists', async () => {
      try {
        await controller.createTransaction(user, {
          accountId: 9876,
          type: TransactionTypeEnum.DEBIT,
          amount: 1200,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    test('account with insufficient balance', async () => {
      try {
        await controller.createTransaction(user, {
          accountId: 9001,
          type: TransactionTypeEnum.DEBIT,
          amount: 200,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(PreconditionFailedException);
      }
    });

    test('transaction created without errors', async () => {
      const result = await controller.createTransaction(user, {
        accountId: 1234,
        type: TransactionTypeEnum.DEBIT,
        amount: 1200,
      });

      expect(result).toHaveProperty('transactionId');
      expect(result.transactionId).toBe(42);
    });
  }); */

  describe('transaction.controller -> createTransaction()', () => {
    const user: UserPayload = {
      userId: '10f88251-d181-4255-92ed-d0d874e3a166',
      iat: 1696354363,
      exp: 1917279163,
    };

    describe('account ownership and existence', () => {
      describe('debit', () => {
        test('user does not have access rights to the account', async () => {
          try {
            await controller.createTransaction(user, {
              accountId: 4242,
              type: TransactionTypeEnum.DEBIT,
              amount: 1200,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
          }
        });
    
        test('account does not exists', async () => {
          try {
            await controller.createTransaction(user, {
              accountId: 9876,
              type: TransactionTypeEnum.DEBIT,
              amount: 1200,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
          }
        });
      });

      describe('credit', () => {
        test('user does not have access rights to the account', async () => {
          try {
            await controller.createTransaction(user, {
              accountId: 4242,
              type: TransactionTypeEnum.CREDIT,
              amount: 1200,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
          }
        });
    
        test('account does not exists', async () => {
          try {
            await controller.createTransaction(user, {
              accountId: 9876,
              type: TransactionTypeEnum.CREDIT,
              amount: 1200,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
          }
        });
      });
    });

    describe('transaction creation', () => {
      describe('debit', () => {
        test('account with insufficient balance', async () => {
          try {
            await controller.createTransaction(user, {
              accountId: 2345,
              type: TransactionTypeEnum.DEBIT,
              amount: 200,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(PreconditionFailedException);
          }
        });
    
        test('transaction created without errors', async () => {
          const result = await controller.createTransaction(user, {
            accountId: 1234,
            type: TransactionTypeEnum.DEBIT,
            amount: 1200,
          });
    
          expect(result).toHaveProperty('transactionId');
          expect(result.transactionId).toBe(42);
        });
      });

      describe('credit', () => {
        test('transaction created without errors', async () => {
          const result = await controller.createTransaction(user, {
            accountId: 1234,
            type: TransactionTypeEnum.CREDIT,
            amount: 1200,
          });
    
          expect(result).toHaveProperty('transactionId');
          expect(result.transactionId).toBe(42);
        });
      });
    });
  });
});
