import { Test, TestingModule } from '@nestjs/testing';
import { PhonesService } from './phones.service';
import { PhonesRepository } from '../repositories/phones/phones.repository';
import { PhonesRepositoryMock } from '../repositories/phones/mocks/';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';

describe('phones.service', () => {
  let service: PhonesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhonesService,
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: PhonesRepository,
          useClass: PhonesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<PhonesService>(PhonesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
