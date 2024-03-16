import { Test, TestingModule } from '@nestjs/testing';
import { LegalDocsResolver } from './legal-docs.resolver';
import { LegalDocsService } from './legal-docs.service';
import { CountriesService } from '../countries/countries.service';
import { UsersService } from '../users/users.service';
import { CountriesRepository } from '../repositories/countries/countries.repository';
import { LegalDocsRepository } from '../repositories/legal-docs/legal-docs.repository';
import { UsersRepository } from '../repositories/users/users.repository';
import { LegalDocsRepositoryMock } from '../repositories/legal-docs/mocks/';
import { CountriesRepositoryMock } from '../repositories/countries/mocks/';
import { UsersRepositoryMock } from '../repositories/users/mocks/';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';

describe('legal-docs.resolver', () => {
  let resolver: LegalDocsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalDocsResolver,
        LegalDocsService,
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
          provide: CountriesRepository,
          useClass: CountriesRepositoryMock,
        },
        {
          provide: UsersRepository,
          useClass: UsersRepositoryMock,
        },
        {
          provide: LegalDocsRepository,
          useClass: LegalDocsRepositoryMock,
        },
      ],
    }).compile();

    resolver = module.get<LegalDocsResolver>(LegalDocsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
