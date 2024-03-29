/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import { Test, TestingModule } from '@nestjs/testing';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BalancesRepository } from './repositories/balances.repository';
import { AuthGuard } from '@shared/authentication/guards/auth.guard';
import { UserService } from '../user/user.service';

describe('balance.controller', () => {
  let controller: BalanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceController],
      providers: [
        BalanceService,
        {
          provide: BalancesRepository,
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
});
