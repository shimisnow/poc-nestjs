/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserAuthsRepository } from './repositories/user-auths/user-auths.repository';
import { UserAuthsRepositoryMock } from './mocks/user-auths-repository.mock';
import { JwtService } from '@nestjs/jwt';

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
        {
          provide: JwtService,
          useValue: {
            signAsync: (payload) =>
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuZGVyc29uIiwic3ViIjoxLCJpYXQiOjE2ODM4MzAyNTEsImV4cCI6MTY4MzgzMDMxMX0.eN5Cv2tJ0HGlVNKMtPv5VPeCIA7dd4OEA-8Heh7OJ_c',
          },
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

    test('username not registered', async () => {
      const result = await controller.verifyIfUsernameIsAvailable({
        username: 'beatrice',
      });

      expect(result).toHaveProperty('available');
      expect(result.available).toBeTruthy();
    });
  });
});
