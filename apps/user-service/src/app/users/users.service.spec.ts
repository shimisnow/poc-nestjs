import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from '../repositories/users/users.repository';
import { UsersRepositoryMock } from './mocks/users-repository.mock';
import { UserEntity } from '../database/entities/user.entity';

describe('users.service', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useClass: UsersRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneById()', () => {
    test('user does exists', async () => {
      const result = await service.findOneById(
        'b0b6065a-dbbf-46a5-8db5-4c089aa17ec1',
      );

      expect(result).toBeInstanceOf(UserEntity);
    });

    test('user does not exists', async () => {
      const result = await service.findOneById(
        'b0b6065a-dbbf-46a5-8db5-4c089aa17ed2',
      );

      expect(result).toBeNull();
    });
  });
});
