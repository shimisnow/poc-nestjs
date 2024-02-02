import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';
import { TransactionsRepository } from './repositories/transactions.repository';
import { BalanceService } from '../balance/balance.service';
import { BalancesRepository } from '../balance/repositories/balances.repository';
import { UserService } from '../user/user.service';

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        TransactionsRepository,
        BalanceService,
        {
          provide: BalancesRepository,
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
          provide: UserService,
          useValue: {},
        }
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
