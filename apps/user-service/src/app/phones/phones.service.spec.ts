import { Test, TestingModule } from '@nestjs/testing';
import { PhonesService } from './phones.service';
import { PhonesRepository } from '../repositories/phones/phones.repository';
import { PhonesRepositoryMock } from './mocks/phones-repository.mock';

describe('phones.service', () => {
  let service: PhonesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhonesService,
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
