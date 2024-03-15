import { Test, TestingModule } from '@nestjs/testing';
import { CountriesService } from './countries.service';
import { CountriesRepository } from '../repositories/countries/countries.repository';
import { CountriesRepositoryMock } from './mocks/countries-repository.mock';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';

describe('countries.service', () => {
  let service: CountriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: CountriesRepository,
          useClass: CountriesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
