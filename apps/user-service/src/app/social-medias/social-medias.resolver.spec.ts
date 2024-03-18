import { Test, TestingModule } from '@nestjs/testing';
import { SocialMediasResolver } from './social-medias.resolver';
import { SocialMediasService } from './social-medias.service';
import { UsersService } from '../users/users.service';
import { SocialMediasRepository } from '../repositories/social-medias/social-medias.repository';
import { UsersRepository } from '../repositories/users/users.repository';
import { UsersRepositoryMock } from '../repositories/users/mocks/';
import { SocialMediasRepositoryMock } from '../repositories/social-medias/mocks/';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { AuthRoleEnum, UserPayload } from '@shared/authentication/graphql';
import { SocialMediaTypeEnum } from '../database/enums/social-media-type.enum';

describe('SocialMediasResolver', () => {
  let resolver: SocialMediasResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialMediasResolver,
        SocialMediasService,
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
          provide: SocialMediasRepository,
          useClass: SocialMediasRepositoryMock,
        },
        {
          provide: UsersRepository,
          useClass: UsersRepositoryMock,
        },
      ],
    }).compile();

    resolver = module.get<SocialMediasResolver>(SocialMediasResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getSocialMedia()', () => {
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
        const result = await resolver.getSocialMedia(user, 1, []);

        expect(result.identifier).toBe('@insta.one');
        expect(result.type).toBe(SocialMediaTypeEnum.INSTAGRAM);
      });

      test('does not exists', async () => {
        const result = await resolver.getSocialMedia(user, 5, []);

        expect(result).toBeNull();
      });
    });

    describe('role admin', () => {
      const now = Math.floor(Date.now() / 1000);
      const user = {
        userId: 'c136d3ce-7380-4fd4-9199-429a6d687083',
        loginId: new Date().getTime().toString(),
        role: AuthRoleEnum.ADMIN,
        iat: now,
        exp: now + 60,
      } as UserPayload;

      test('exists', async () => {
        const result = await resolver.getSocialMedia(user, 5, []);

        expect(result.identifier).toBe('/linkedin.five');
        expect(result.type).toBe(SocialMediaTypeEnum.LINKEDIN);
      });

      test('user is not the owner', async () => {
        const result = await resolver.getSocialMedia(user, 1, []);

        expect(result.identifier).toBe('@insta.one');
        expect(result.type).toBe(SocialMediaTypeEnum.INSTAGRAM);
      });
    });
  });

  describe('getUser()', () => {
    const socialMedia = {
      user: {
        userId: 'c136d3ce-7380-4fd4-9199-429a6d687081',
      },
    };

    test('user retrieve', async () => {
      const result = await resolver.getUser(socialMedia as any, []);

      expect(result.name).toBe('One');
    });
  });
});
