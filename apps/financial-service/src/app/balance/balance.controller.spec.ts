import { Test, TestingModule } from '@nestjs/testing';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BalanceEntity } from '@shared/database/entities/balance.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BalancesRepository } from './repositories/balances.repository';
import { TransactionEntity } from '@shared/database/entities/transaction.entity';
import { NotFoundException } from '@nestjs/common';

describe('BalanceController', () => {
  let controller: BalanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceController],
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            set: (key, value) => {},
          },
        },
        {
          provide: getRepositoryToken(BalanceEntity),
          useValue: {
            findOne: async (options) => {
              switch (options.where.accountId) {
                case 1234:
                  // eslint-disable-next-line no-case-declarations
                  const entity = new BalanceEntity();
                  entity.balance = 1200;
                  entity.lastTransactionId = 100;
                  return entity;
                // account id does not exists
                default:
                  return null;
              }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    controller = module.get<BalanceController>(BalanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('balance.controller -> getBalance()', () => {
    test('account does not exists', async () => {
      try {
        await controller.getBalance({ accountId: 9876 });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    test('get balance from cache', async () => {
      const result = await controller.getBalance({ accountId: 2345 });
      expect(result.balance).toBe(950);
    });

    test('get balance from database (no cache)', async () => {
      const result = await controller.getBalance({ accountId: 1234 });
      // 1200 from the mocked balance and 50 from the mocked transactions
      expect(result.balance).toBe(1250);
    });
  });
});
