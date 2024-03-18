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
import { AuthRoleEnum, UserPayload } from '@shared/authentication/graphql';
import { LegalDocTypeEnum } from '../database/enums/legal-doc-type.enum';

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

  describe('getLegalDoc()', () => {
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
        const result = await resolver.getLegalDoc(user, 1, []);

        expect(result.identifier).toBe('123456789-1');
        expect(result.type).toBe(LegalDocTypeEnum.BRA_CNH);
      });

      test('does not exists', async () => {
        const result = await resolver.getLegalDoc(user, 3, []);

        expect(result).toBeNull();
      });
    });

    describe('role admin', () => {
      const now = Math.floor(Date.now() / 1000);
      const user = {
        userId: 'c136d3ce-7380-4fd4-9199-429a6d687084',
        loginId: new Date().getTime().toString(),
        role: AuthRoleEnum.ADMIN,
        iat: now,
        exp: now + 60,
      } as UserPayload;

      test('exists', async () => {
        const result = await resolver.getLegalDoc(user, 3, []);

        expect(result.identifier).toBe('123456789-3');
        expect(result.type).toBe(LegalDocTypeEnum.USA_SSN);
      });

      test('user is not the owner', async () => {
        const result = await resolver.getLegalDoc(user, 1, []);

        expect(result.identifier).toBe('123456789-1');
        expect(result.type).toBe(LegalDocTypeEnum.BRA_CNH);
      });
    });
  });

  describe('getCountry()', () => {
    const legalDoc = {
      country: {
        code: 'BRA',
      },
    };

    test('country retrieve', async () => {
      const result = await resolver.getCountry(legalDoc as any, []);

      expect(result.callingCode).toBe(55);
    });
  });

  describe('getUser()', () => {
    const legalDoc = {
      user: {
        userId: 'c136d3ce-7380-4fd4-9199-429a6d687081',
      },
    };

    test('user retrieve', async () => {
      const result = await resolver.getUser(legalDoc as any, []);

      expect(result.name).toBe('One');
    });
  });
});
