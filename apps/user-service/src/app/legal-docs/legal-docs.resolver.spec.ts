import { Test, TestingModule } from '@nestjs/testing';
import { LegalDocsResolver } from './legal-docs.resolver';
import { LegalDocsService } from './legal-docs.service';
import { CountriesService } from '../countries/countries.service';
import { UsersService } from '../users/users.service';
import { CountriesRepository } from '../repositories/countries/countries.repository';
import { LegalDocsRepository } from '../repositories/legal-docs/legal-docs.repository';
import { UsersRepository } from '../repositories/users/users.repository';
import { CountriesRepositoryMock } from './mocks/countries-repository.mock';
import { UsersRepositoryMock } from './mocks/users-repository.mock';
import { LegalDocsRepositoryMock } from './mocks/legal-docs-repository.mock';

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
