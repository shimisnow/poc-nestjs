import { Test, TestingModule } from '@nestjs/testing';
import { CountriesResolver } from './countries.resolver';
import { CountriesService } from '../countries/countries.service';
import { CountriesRepository } from '../repositories/countries/countries.repository';
import { CountriesRepositoryMock } from '../repositories/countries/mocks/';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { CountryCodeEnum } from '../database/enums/country-code.enum';

describe('countries.resolver', () => {
  let resolver: CountriesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesResolver,
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

    resolver = module.get<CountriesResolver>(CountriesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getCountry()', () => {
    test('country exists', async () => {
      const result = await resolver.getCountry(CountryCodeEnum.BRA, []);

      expect(result.callingCode).toBe(55);
    });

    test('country does not exists', async () => {
      const result = await resolver.getCountry('XYZ' as any, []);

      expect(result).toBe(null);
    });
  });
});
