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

describe('users.resolver', () => {
  let resolver: UsersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        UsersService,
        AddressesService,
        PhonesService,
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
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
