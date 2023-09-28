import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from './balance.service';
import { BalancesRepository } from './repositories/balances.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BalanceEntity } from '@shared/database/entities/balance.entity';
import { TransactionEntity } from '@shared/database/entities/transaction.entity';

describe('BalanceService', () => {
  let service: BalanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        BalancesRepository,
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
        {
          provide: getRepositoryToken(BalanceEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(TransactionEntity),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
