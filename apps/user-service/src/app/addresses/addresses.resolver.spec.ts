import { Test, TestingModule } from '@nestjs/testing';
import { AddressesResolver } from './addresses.resolver';
import { AddressesService } from './addresses.service';
import { CountriesService } from '../countries/countries.service';
import { UsersService } from '../users/users.service';
import { AddressesRepository } from '../repositories/addresses/addresses.repository';
import { CountriesRepository } from '../repositories/countries/countries.repository';
import { UsersRepository } from '../repositories/users/users.repository';
import { AddressesRepositoryMock } from '../repositories/addresses/mocks/';
import { CountriesRepositoryMock } from '../repositories/countries/mocks/';
import { UsersRepositoryMock } from '../repositories/users/mocks/';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { AuthRoleEnum, UserPayload } from '@shared/authentication/graphql';
import { AddressTypeEnum } from '../database/enums/address-type.enum';

describe('addresses.resolver', () => {
  let resolver: AddressesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesResolver,
        AddressesService,
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
          provide: AddressesRepository,
          useClass: AddressesRepositoryMock,
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

    resolver = module.get<AddressesResolver>(AddressesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getAddress()', () => {
    describe('role user', () => {
      const now = Math.floor(Date.now() / 1000);
      const user = {
        userId: 'c136d3ce-7380-4fd4-9199-429a6d687081',
        loginId: new Date().getTime().toString(),
        role: AuthRoleEnum.USER,
        iat: now,
        exp: now + 60,
      } as UserPayload;

      test('address exists', async () => {
        const result = await resolver.getAddress(user, 1, []);

        expect(result.postalcode).toBe('12345678');
        expect(result.type).toBe(AddressTypeEnum.MAIN);
      });

      test('address does not exists', async () => {
        const result = await resolver.getAddress(user, 3, []);

        expect(result).toBeNull();
      });
    });

    describe('role admin', () => {
      const now = Math.floor(Date.now() / 1000);
      const user = {
        userId: 'c136d3ce-7380-4fd4-9199-429a6d6870ab',
        loginId: new Date().getTime().toString(),
        role: AuthRoleEnum.ADMIN,
        iat: now,
        exp: now + 60,
      } as UserPayload;

      test('address exists', async () => {
        const result = await resolver.getAddress(user, 1, []);

        expect(result.postalcode).toBe('12345678');
        expect(result.type).toBe(AddressTypeEnum.MAIN);
      });

      test('address does not exists', async () => {
        const result = await resolver.getAddress(user, 3, []);

        expect(result.postalcode).toBe('34567890');
        expect(result.type).toBe(AddressTypeEnum.MAIN);
      });
    });
  });

  describe('getCountry()', () => {
    const address = {
      country: {
        code: 'BRA',
      },
    };

    test('country retrieve', async () => {
      const result = await resolver.getCountry(address as any, []);

      expect(result.callingCode).toBe(55);
    });
  });

  describe('getUser()', () => {
    const address = {
      user: {
        userId: 'c136d3ce-7380-4fd4-9199-429a6d687081',
      },
    };

    test('user retrieve', async () => {
      const result = await resolver.getUser(address as any, []);

      expect(result.name).toBe('One');
    });
  });
});
