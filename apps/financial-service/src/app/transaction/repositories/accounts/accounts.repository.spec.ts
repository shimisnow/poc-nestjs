import { Test, TestingModule } from '@nestjs/testing';
import { AccountsRepository } from './accounts.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccountEntity } from '../../../database/entities/account.entity';
import { AccountStatusEnum } from '../../../database/enums/account-status.enum';

describe('AccountsRepository', () => {
  let repository: AccountsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsRepository,
        {
          provide: getRepositoryToken(AccountEntity),
          useValue: {
            find: (options): Array<AccountEntity> => {
              // simulates when verifying if the user exists ignoring the status
              if (options.where.status === undefined) {
                switch (options.where.accountId) {
                  case 1:
                    return [
                      {
                        accountId: 1,
                        userId: '',
                        status: AccountStatusEnum.ACTIVE,
                      },
                    ];
                  case 2:
                    return [
                      {
                        accountId: 2,
                        userId: '',
                        status: AccountStatusEnum.INACTIVE,
                      },
                    ];
                }
              }
              // simulates when verifying if the user is active
              switch (options.where.accountId) {
                case 3:
                  return [
                    {
                      accountId: 3,
                      userId: '',
                      status: AccountStatusEnum.ACTIVE,
                    },
                  ];
                case 4:
                  // simulates that is inactive
                  return [];
              }

              return [];
            },
          },
        },
      ],
    }).compile();

    repository = module.get<AccountsRepository>(AccountsRepository);
  });

  describe('accountExists()', () => {
    describe('with isActive = false', () => {
      test('account does not exists', async () => {
        let result = await repository.accountExists(5);
        expect(result).toBeFalsy();

        result = await repository.accountExists(5, false);
        expect(result).toBeFalsy();
      });

      test('account exists and is inactive', async () => {
        let result = await repository.accountExists(2);
        expect(result).toBeTruthy();

        result = await repository.accountExists(2, false);
        expect(result).toBeTruthy();
      });

      test('account exists and is active', async () => {
        let result = await repository.accountExists(1);
        expect(result).toBeTruthy();

        result = await repository.accountExists(1, false);
        expect(result).toBeTruthy();
      });
    });

    describe('with isActive = true', () => {
      test('account does not exists', async () => {
        const result = await repository.accountExists(5, true);
        expect(result).toBeFalsy();
      });

      test('account exists and is inactive', async () => {
        const result = await repository.accountExists(4, true);
        expect(result).toBeFalsy();
      });

      test('account exists and is active', async () => {
        const result = await repository.accountExists(3, true);
        expect(result).toBeTruthy();
      });
    });
  });
});
