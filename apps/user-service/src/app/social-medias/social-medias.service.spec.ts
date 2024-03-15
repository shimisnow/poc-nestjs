import { Test, TestingModule } from '@nestjs/testing';
import { SocialMediasService } from './social-medias.service';
import { SocialMediasRepository } from '../repositories/social-medias/social-medias.repository';
import { SocialMediasRepositoryMock } from './mocks/social-medias-repository.mock';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';

describe('SocialMediasService', () => {
  let service: SocialMediasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
          provide: SocialMediasRepository,
          useClass: SocialMediasRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<SocialMediasService>(SocialMediasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
