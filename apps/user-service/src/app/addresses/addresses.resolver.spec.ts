import { Test, TestingModule } from '@nestjs/testing';
import { AddressesResolver } from './addresses.resolver';
import { AddressesService } from './addresses.service';
import { CountriesService } from '../countries/countries.service';
import { UsersService } from '../users/users.service';
import { AddressesRepository } from '../repositories/addresses/addresses.repository';
import { CountriesRepository } from '../repositories/countries/countries.repository';
import { UsersRepository } from '../repositories/users/users.repository';
import { AddressesRepositoryMock } from './mocks/addresses-repository.mock';
import { CountriesRepositoryMock } from './mocks/countries-repository.mock';
import { UsersRepositoryMock } from './mocks/users-repository.mock';

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
