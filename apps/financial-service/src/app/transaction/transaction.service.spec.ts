import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';
import { TransactionsRepository } from './repositories/transactions.repository';
import { BalanceService } from '../balance/balance.service';
import { BalancesRepository } from '../balance/repositories/balances.repository';
import { UserService } from '../user/user.service';
import { ForbiddenException, PreconditionFailedException } from '@nestjs/common';
import { TransactionTypeEnum } from '@shared/database/financial/enums/transaction-type.enum';

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        TransactionsRepository,
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
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transaction.service -> createTransaction()', () => {
    describe('account ownership and existence', () => {
      describe('debit', () => {
        test('user does not have access rights to the account', async () => {
          try {
            await service.createTransaction('10f88251-d181-4255-92ed-d0d874e3a166', {
              accountId: 4242,
              type: TransactionTypeEnum.DEBIT,
              amount: -1200,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
          }
        });
    
        test('account does not exists', async () => {
          try {
            await service.createTransaction('10f88251-d181-4255-92ed-d0d874e3a166', {
              accountId: 9876,
              type: TransactionTypeEnum.DEBIT,
              amount: -1200,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
          }
        });
      });

      describe('credit', () => {
        test('user does not have access rights to the account', async () => {
          try {
            await service.createTransaction('10f88251-d181-4255-92ed-d0d874e3a166', {
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
            await service.createTransaction('10f88251-d181-4255-92ed-d0d874e3a166', {
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
            await service.createTransaction('10f88251-d181-4255-92ed-d0d874e3a166', {
              accountId: 2345,
              type: TransactionTypeEnum.DEBIT,
              amount: -200,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(PreconditionFailedException);
          }
        });
    
        test('transaction created without errors', async () => {
          const result = await service.createTransaction('10f88251-d181-4255-92ed-d0d874e3a166', {
            accountId: 1234,
            type: TransactionTypeEnum.DEBIT,
            amount: -1200,
          });
    
          expect(result).toHaveProperty('transactionId');
          expect(result.transactionId).toBe(42);
        });
      });

      describe('credit', () => {
        test('transaction created without errors', async () => {
          const result = await service.createTransaction('10f88251-d181-4255-92ed-d0d874e3a166', {
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
