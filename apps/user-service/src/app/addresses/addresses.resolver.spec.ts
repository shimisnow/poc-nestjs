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
});
