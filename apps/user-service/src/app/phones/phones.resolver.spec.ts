import { Test, TestingModule } from '@nestjs/testing';
import { PhonesResolver } from './phones.resolver';
import { PhonesService } from './phones.service';
import { CountriesService } from '../countries/countries.service';
import { UsersService } from '../users/users.service';
import { PhonesRepository } from '../repositories/phones/phones.repository';
import { CountriesRepository } from '../repositories/countries/countries.repository';
import { UsersRepository } from '../repositories/users/users.repository';
import { PhonesRepositoryMock } from '../repositories/phones/mocks/';
import { CountriesRepositoryMock } from '../repositories/countries/mocks/';
import { UsersRepositoryMock } from '../repositories/users/mocks/';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { AuthRoleEnum, UserPayload } from '@shared/authentication/graphql';
import { PhoneTypeEnum } from '../database/enums/phone-type.enum';

describe('phones.resolver', () => {
  let resolver: PhonesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhonesResolver,
        PhonesService,
        CountriesService,
        UsersService,
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: PhonesRepository,
          useClass: PhonesRepositoryMock,
        },
        {
          provide: CountriesRepository,
          useClass: CountriesRepositoryMock,
        },
        {
          provide: UsersRepository,
          useClass: UsersRepositoryMock,
        },
      ],
    }).compile();

    resolver = module.get<PhonesResolver>(PhonesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getPhone()', () => {
    describe('role user', () => {
      const now = Math.floor(Date.now() / 1000);
      const user = {
        userId: 'c136d3ce-7380-4fd4-9199-429a6d687081',
        loginId: new Date().getTime().toString(),
        role: AuthRoleEnum.USER,
        iat: now,
        exp: now + 60,
      } as UserPayload;

      test('exists', async () => {
        const result = await resolver.getPhone(user, 1, []);

        expect(result.number).toBe(12345671);
        expect(result.type).toBe(PhoneTypeEnum.HOME);
      });

      test('does not exists', async () => {
        const result = await resolver.getPhone(user, 4, []);

        expect(result).toBeNull();
      });
    });

    describe('role admin', () => {
      const now = Math.floor(Date.now() / 1000);
      const user = {
        userId: 'c136d3ce-7380-4fd4-9199-429a6d687082',
        loginId: new Date().getTime().toString(),
        role: AuthRoleEnum.ADMIN,
        iat: now,
        exp: now + 60,
      } as UserPayload;

      test('exists', async () => {
        const result = await resolver.getPhone(user, 2, []);

        expect(result.number).toBe(12345672);
        expect(result.type).toBe(PhoneTypeEnum.WORK);
      });

      test('user is not the owner', async () => {
        const result = await resolver.getPhone(user, 1, []);

        expect(result.number).toBe(12345671);
        expect(result.type).toBe(PhoneTypeEnum.HOME);
      });
    });
  });

  describe('getCountry()', () => {
    const phone = {
      country: {
        code: 'BRA',
      },
    };

    test('country retrieve', async () => {
      const result = await resolver.getCountry(phone as any, []);

      expect(result.callingCode).toBe(55);
    });
  });

  describe('getUser()', () => {
    const phone = {
      user: {
        userId: 'c136d3ce-7380-4fd4-9199-429a6d687081',
      },
    };

    test('user retrieve', async () => {
      const result = await resolver.getUser(phone as any, []);

      expect(result.name).toBe('One');
    });
  });
});
