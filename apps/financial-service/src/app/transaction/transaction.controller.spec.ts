/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionEntity } from '../database/entities/transaction.entity';
import { TransactionsRepository } from './repositories/transactions/transactions.repository';
import { TransactionService } from './transaction.service';
import { BalanceService } from '../balance/balance.service';
import { BalancesRepository } from '../balance/repositories/balances.repository';
import { AuthGuard } from '@shared/authentication/guards/auth.guard';
import { UserService } from '../user/user.service';
import { AccountsRepository } from './repositories/accounts/accounts.repository';

describe('transaction.controller', () => {
  let controller: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        TransactionService,
        TransactionsRepository,
        {
          provide: AccountsRepository,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
        {
          provide: getRepositoryToken(TransactionEntity),
          useValue: {},
        },
        {
          provide: BalanceService,
          useValue: {},
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
});
