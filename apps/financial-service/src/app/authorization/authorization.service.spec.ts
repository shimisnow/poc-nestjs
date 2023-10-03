import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationService } from './authorization.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccountEntity } from '@shared/database/financial/entities/account.entity';

describe('AuthorizationService', () => {
  let service: AuthorizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
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

    service = module.get<AuthorizationService>(AuthorizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authorization.service -> userHasAccessToAccount()', () => {
    test('user has no access to the account', async () => {
      const result = await service.userHasAccessToAccount(
        '44a6eaeb-fcaa-4889-9ddc-9e6b86db7351',
        9091,
      );

      expect(result).toBeFalsy();
    });

    test('user has access to the account', async () => {
      const result = await service.userHasAccessToAccount(
        '44a6eaeb-fcaa-4889-9ddc-9e6b86db7351',
        9090,
      );

      expect(result).toBeTruthy();
    });

    test('database error', async () => {
      const result = await service.userHasAccessToAccount(
        '44a6eaeb-fcaa-4889-9ddc-9e6b86db4444',
        1445,
      );

      expect(result).toBeFalsy();
    });
  });
});
