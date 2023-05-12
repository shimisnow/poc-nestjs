import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserAuthsRepository } from './repositories/user-auths/user-auths.repository';
import { UserAuthsRepositoryMock } from './mocks/user-auths-repository.mock';
import { BadGatewayException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UserAuthsRepository,
          useClass: UserAuthsRepositoryMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('auth.controller -> verifyIfUsernameExists()', () => {
    test('username already registered', async () => {
      const result = await controller.verifyIfUsernameIsAvailable({
        username: 'anderson',
      });

      expect(result).toHaveProperty('available');
      expect(result.available).toBeFalsy();
    });

    test('username NOT registered', async () => {
      const result = await controller.verifyIfUsernameIsAvailable({
        username: 'beatrice',
      });

      expect(result).toHaveProperty('available');
      expect(result.available).toBeTruthy();
    });

    test('some database error', async () => {
      try {
        await controller.verifyIfUsernameIsAvailable({ username: 'anything' });
      } catch (error) {
        expect(error).toBeInstanceOf(BadGatewayException);
      }
    });
  });
});
