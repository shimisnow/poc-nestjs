import { Test, TestingModule } from '@nestjs/testing';
import { CountriesResolver } from './countries.resolver';
import { CountriesService } from '../countries/countries.service';
import { CountriesRepository } from '../repositories/countries/countries.repository';
import { CountriesRepositoryMock } from './mocks/countries-repository.mock';

describe('countries.resolver', () => {
  let resolver: CountriesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesResolver,
        CountriesService,
        {
          provide: CountriesRepository,
          useClass: CountriesRepositoryMock,
        },
      ],
    }).compile();

    resolver = module.get<CountriesResolver>(CountriesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
