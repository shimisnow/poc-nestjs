import { Test, TestingModule } from '@nestjs/testing';
import { SocialMediasResolver } from './social-medias.resolver';
import { SocialMediasService } from './social-medias.service';
import { UsersService } from '../users/users.service';
import { SocialMediasRepository } from '../repositories/social-medias/social-medias.repository';
import { SocialMediasRepositoryMock } from './mocks/social-medias-repository.mock';
import { UsersRepository } from '../repositories/users/users.repository';
import { UsersRepositoryMock } from './mocks/users-repository.mock';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';

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
});
