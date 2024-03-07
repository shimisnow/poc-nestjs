import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { AddressesService } from '../addresses/addresses.service';
import { PhonesService } from '../phones/phones.service';
import { AddressesRepository } from '../repositories/addresses/addresses.repository';
import { PhonesRepository } from '../repositories/phones/phones.repository';
import { UsersRepository } from '../repositories/users/users.repository';
import { AddressesRepositoryMock } from './mocks/addresses-repository.mock';
import { PhonesRepositoryMock } from './mocks/phones-repository.mock';
import { UsersRepositoryMock } from './mocks/users-repository.mock';
import { LegalDocsService } from '../legal-docs/legal-docs.service';
import { LegalDocsRepository } from '../repositories/legal-docs/legal-docs.repository';
import { SocialMediasRepository } from '../repositories/social-medias/social-medias.repository';
import { LegalDocsRepositoryMock } from './mocks/legal-docs-repository.mock';
import { SocialMediasService } from '../social-medias/social-medias.service';
import { SocialMediasRepositoryMock } from './mocks/social-medias-repository.mock';

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

  /* describe('getUser()', () => {
    test('user does exists', async () => {
      const result = await resolver.getUser(
        'b0b6065a-dbbf-46a5-8db5-4c089aa17ec1',
      );

      expect(result).toBeInstanceOf(UserEntity);
    });

    test('user does not exists', async () => {
      const result = await resolver.getUser(
        'b0b6065a-dbbf-46a5-8db5-4c089aa17ed2',
      );

      expect(result).toBeNull();
    });
  }); */

  describe('getAddresses()', () => {
    return;
  });

  describe('getPhones()', () => {
    return;
  });
});
