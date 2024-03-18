import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { AddressesService } from '../addresses/addresses.service';
import { PhonesService } from '../phones/phones.service';
import { AddressesRepository } from '../repositories/addresses/addresses.repository';
import { PhonesRepository } from '../repositories/phones/phones.repository';
import { UsersRepository } from '../repositories/users/users.repository';
import { LegalDocsService } from '../legal-docs/legal-docs.service';
import { LegalDocsRepository } from '../repositories/legal-docs/legal-docs.repository';
import { SocialMediasRepository } from '../repositories/social-medias/social-medias.repository';
import { SocialMediasService } from '../social-medias/social-medias.service';
import { PhonesRepositoryMock } from '../repositories/phones/mocks/';
import { LegalDocsRepositoryMock } from '../repositories/legal-docs/mocks/';
import { AddressesRepositoryMock } from '../repositories/addresses/mocks/';
import { UsersRepositoryMock } from '../repositories/users/mocks/';
import { SocialMediasRepositoryMock } from '../repositories/social-medias/mocks/';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { AuthRoleEnum, UserPayload } from '@shared/authentication/graphql';
import { SocialMediaTypeEnum } from '../database/enums/social-media-type.enum';
import { AddressTypeEnum } from '../database/enums/address-type.enum';
import { PhoneTypeEnum } from '../database/enums/phone-type.enum';
import { LegalDocTypeEnum } from '../database/enums/legal-doc-type.enum';

describe('users.resolver', () => {
  let resolver: UsersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        UsersService,
        AddressesService,
        PhonesService,
        LegalDocsService,
        SocialMediasService,
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
          provide: PhonesRepository,
          useClass: PhonesRepositoryMock,
        },
        {
          provide: UsersRepository,
          useClass: UsersRepositoryMock,
        },
        {
          provide: LegalDocsRepository,
          useClass: LegalDocsRepositoryMock,
        },
        {
          provide: SocialMediasRepository,
          useClass: SocialMediasRepositoryMock,
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getUser()', () => {
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
        const result = await resolver.getUser(
          user,
          'c136d3ce-7380-4fd4-9199-429a6d687081',
          [],
        );

        expect(result.userId).toBe('c136d3ce-7380-4fd4-9199-429a6d687081');
        expect(result.name).toBe('One');
      });

      test('does not exists', async () => {
        const result = await resolver.getUser(
          user,
          'c136d3ce-7380-4fd4-9199-429a6d687082',
          [],
        );

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
        const result = await resolver.getUser(
          user,
          'c136d3ce-7380-4fd4-9199-429a6d687083',
          [],
        );

        expect(result.userId).toBe('c136d3ce-7380-4fd4-9199-429a6d687083');
        expect(result.name).toBe('Three');
      });

      test('user is not the owner', async () => {
        const result = await resolver.getUser(
          user,
          'c136d3ce-7380-4fd4-9199-429a6d687081',
          [],
        );

        expect(result.userId).toBe('c136d3ce-7380-4fd4-9199-429a6d687081');
        expect(result.name).toBe('One');
      });
    });
  });

  describe('getAddresses()', () => {
    test('retrieve', async () => {
      const user = {
        userId: 'c136d3ce-7380-4fd4-9199-429a6d687081',
      };

      const result = await resolver.getAddresses(user as any, []);

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: AddressTypeEnum.MAIN,
            postalcode: '12345678',
          }),
        ]),
      );

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: AddressTypeEnum.LEGAL,
            postalcode: '23456789',
          }),
        ]),
      );
    });
  });

  describe('getPhones()', () => {
    test('retrieve', async () => {
      const user = {
        userId: 'c136d3ce-7380-4fd4-9199-429a6d687081',
      };

      const result = await resolver.getPhones(user as any, []);

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: PhoneTypeEnum.HOME,
            number: 12345671,
          }),
        ]),
      );

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: PhoneTypeEnum.WORK,
            number: 12345672,
          }),
        ]),
      );
    });
  });

  describe('getLegalDocs()', () => {
    test('retrieve', async () => {
      const user = {
        userId: 'c136d3ce-7380-4fd4-9199-429a6d687081',
      };

      const result = await resolver.getLegalDocs(user as any, []);

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: LegalDocTypeEnum.BRA_CNH,
            identifier: '123456789-1',
          }),
        ]),
      );

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: LegalDocTypeEnum.BRA_RG,
            identifier: '123456789-2',
          }),
        ]),
      );
    });
  });

  describe('getSocialMedias()', () => {
    test('retrieve', async () => {
      const user = {
        userId: 'c136d3ce-7380-4fd4-9199-429a6d687081',
      };

      const result = await resolver.getSocialMedias(user as any, []);

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: SocialMediaTypeEnum.INSTAGRAM,
            identifier: '@insta.one',
          }),
        ]),
      );

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: SocialMediaTypeEnum.YOUTUBE,
            identifier: '/yt.two',
          }),
        ]),
      );
    });
  });
});
