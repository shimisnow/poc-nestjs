import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service';
import { AddressesRepository } from '../repositories/addresses/addresses.repository';
import { AddressesRepositoryMock } from './mocks/addresses-repository.mock';

describe('addresses.service', () => {
  let service: AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: AddressesRepository,
          useClass: AddressesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
