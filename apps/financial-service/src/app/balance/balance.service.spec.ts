/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from './balance.service';
import { BalancesRepository } from './repositories/balances.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BalanceEntity } from '@shared/database/financial/entities/balance.entity';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';
import { ForbiddenException } from '@nestjs/common';
import { UserService } from '../user/user.service';

describe('BalanceService', () => {
  let service: BalanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        BalancesRepository,
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
            get: (key) => {
              switch (key) {
                case 'balance-acc-2345':
                  return {
                    balance: 950,
                    updatedA: new Date(),
                  };
                // no cache
                default:
                  return null;
              }
            },
            set: (key, value) => {},
          },
        },
        {
          provide: getRepositoryToken(BalanceEntity),
          useValue: {
            findOne: async (options) => {
              switch (options.where.account.accountId) {
                case 1234:
                  const transaction = new TransactionEntity();
                  transaction.transactionId = 100;
                  const entity = new BalanceEntity();
                  entity.balance = 1200;
                  entity.lastTransaction = transaction;
                  return entity;
                case 2345:
                  const transaction1 = new TransactionEntity();
                  transaction1.transactionId = 50;
                  const entity1 = new BalanceEntity();
                  entity1.balance = 500;
                  entity1.lastTransaction = transaction1;
                  return entity1;
                // account id does not exists
                default:
                  return null;
              }
            },
            update: (options, entity) => {},
          },
        },
        {
          provide: getRepositoryToken(TransactionEntity),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getRawOne: () => {
                return {
                  deltaBalance: 50,
                  maxTransactionId: 180,
                };
              },
            })),
          },
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('balance.service -> getBalance()', () => {
    describe('account ownership and existence', () => {
      test('user does not have access rights to the account', async () => {
        try {
          await service.getBalance(4242, '10f88251-d181-4255-92ed-d0d874e3a166');
        } catch (error) {
          expect(error).toBeInstanceOf(ForbiddenException);
        }
      });

      // there is no way to know if the account does no exists or if the user has no access
      // the error will be the same
      test('account does not exists', async () => {
        try {
          await service.getBalance(9876, '10f88251-d181-4255-92ed-d0d874e3a166');
        } catch (error) {
          expect(error).toBeInstanceOf(ForbiddenException);
        }
      });
    });

    describe('balance retrieval', () => {
      test('get balance from cache', async () => {
        const result = await service.getBalance(2345, '3caf49e3-a722-4fba-b9b9-cd576a887db6');
        expect(result.balance).toBe(950);
      });
  
      test('get balance from database (no cache)', async () => {
        const result = await service.getBalance(1234, '3caf49e3-a722-4fba-b9b9-cd576a887db6');
        // 1200 from the mocked balance and 50 from the mocked transactions
        expect(result.balance).toBe(1250);
      });
    });
  });

  describe('balance.service -> getBalanceIgnoringCache()', () => {
    describe('account ownership and existence', () => {
      test('user does not have access rights to the account', async () => {
        try {
          await service.getBalanceIgnoringCache(4242, '10f88251-d181-4255-92ed-d0d874e3a166');
        } catch (error) {
          expect(error).toBeInstanceOf(ForbiddenException);
        }
      });

      // there is no way to know if the account does no exists or if the user has no access
      // the error will be the same
      test('account does not exists', async () => {
        try {
          await service.getBalanceIgnoringCache(9876, '10f88251-d181-4255-92ed-d0d874e3a166');
        } catch (error) {
          expect(error).toBeInstanceOf(ForbiddenException);
        }
      });
    });

    describe('balance retrieval', () => {
      test('get balance ignoring cache', async () => {
        const result = await service.getBalanceIgnoringCache(2345, '3caf49e3-a722-4fba-b9b9-cd576a887db6');
        // 1200 from the mocked balance and 50 from the mocked transactions
        expect(result).toBe(550);
      });
    });
  });
});
