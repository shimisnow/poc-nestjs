import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionEntity } from '@shared/database/entities/transaction.entity';
import { TransactionsRepository } from './repositories/transactions.repository';

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        TransactionsRepository,
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
        {
          provide: getRepositoryToken(TransactionEntity),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
