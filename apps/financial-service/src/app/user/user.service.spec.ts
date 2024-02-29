import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccountEntity } from '@shared/database/financial/entities/account.entity';
import { AccountsRepository } from './repositories/accounts/accounts.repository';

describe('user.service', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        AccountsRepository,
        {
          provide: getRepositoryToken(AccountEntity),
          useValue: {
            findOne: async (options) => {
              switch (options.where.userId) {
                case '44a6eaeb-fcaa-4889-9ddc-9e6b86db7351':
                  if (options.where.accountId == 9090) {
                    const account = new AccountEntity();
                    account.userId = '44a6eaeb-fcaa-4889-9ddc-9e6b86db7351';
                    account.accountId = 9090;
                    return account;
                  }

                  return null;
                default:
                  throw new Error();
              }
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hasAccessToAccount()', () => {
    test('user has no access to the account', async () => {
      const result = await service.hasAccessToAccount(
        '44a6eaeb-fcaa-4889-9ddc-9e6b86db7351',
        9091,
      );

      expect(result).toBeFalsy();
    });

    test('user has access to the account', async () => {
      const result = await service.hasAccessToAccount(
        '44a6eaeb-fcaa-4889-9ddc-9e6b86db7351',
        9090,
      );

      expect(result).toBeTruthy();
    });

    test('database error', async () => {
      const result = await service.hasAccessToAccount(
        '44a6eaeb-fcaa-4889-9ddc-9e6b86db4444',
        1445,
      );

      expect(result).toBeFalsy();
    });
  });
});
