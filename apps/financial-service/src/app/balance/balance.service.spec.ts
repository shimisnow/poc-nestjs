/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from './balance.service';
import { BalancesRepository } from './repositories/balances.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BalanceEntity } from '@shared/database/financial/entities/balance.entity';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';
import { NotFoundException } from '@nestjs/common';

describe('BalanceService', () => {
  let service: BalanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        BalancesRepository,
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
    test('account does not exists', async () => {
      try {
        await service.getBalance(9876);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    test('get balance from cache', async () => {
      const result = await service.getBalance(2345);
      expect(result).toBe(950);
    });

    test('get balance from database (no cache)', async () => {
      const result = await service.getBalance(1234);
      // 1200 from the mocked balance and 50 from the mocked transactions
      expect(result).toBe(1250);
    });
  });
});
