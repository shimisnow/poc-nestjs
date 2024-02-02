/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import { Test, TestingModule } from '@nestjs/testing';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BalanceEntity } from '@shared/database/financial/entities/balance.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BalancesRepository } from './repositories/balances.repository';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';
import { ForbiddenException, NotFoundException, Response } from '@nestjs/common';
import { UserPayload } from '@shared/authentication/payloads/user.payload';
import { AuthGuard } from '@shared/authentication/guards/auth.guard';
import { UserService } from '../user/user.service';

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
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<BalanceController>(BalanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('balance.controller -> getBalance()', () => {
    const user: UserPayload = {
      userId: '10f88251-d181-4255-92ed-d0d874e3a166',
      iat: 1696354363,
      exp: 1917279163,
    };

    describe('account ownership and existence', () => {
      test('user does not have access rights to the account', async () => {
        try {
          await controller.getBalance(user, { accountId: 3456 });
        } catch (error) {
          expect(error).toBeInstanceOf(ForbiddenException);
        }
      });

      // there is no way to know if the account does no exists or if the user has no access
      // the error will be the same
      test('account does not exists', async () => {
        try {
          await controller.getBalance(user, { accountId: 4567 });
        } catch (error) {
          expect(error).toBeInstanceOf(ForbiddenException);
        }
      });
    });

    describe('balance retrieval', () => {
      test('get balance from cache', async () => {
        const result = await controller.getBalance(user, { accountId: 2345 });
        expect(result.balance).toBe(950);
        expect(result.cached).toBeTruthy();
      });
      test('get balance from database (no cache)', async () => {
        const result = await controller.getBalance(user, { accountId: 1234 });
        // 1200 from the mocked balance and 50 from the mocked transactions
        expect(result.balance).toBe(1250);
        expect(result.cached).toBeFalsy();
      });
    });
  });
});
