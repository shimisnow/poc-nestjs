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
});
