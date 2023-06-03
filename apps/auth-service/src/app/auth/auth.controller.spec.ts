import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserAuthsRepository } from './repositories/user-auths/user-auths.repository';
import { UserAuthsRepositoryMock } from './mocks/user-auths-repository.mock';
import { BadGatewayException, UnauthorizedException } from '@nestjs/common';
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

  describe('auth.controller -> login()', () => {
    test('correct login data with ACTIVE user', async () => {
      const result = await controller.login({
        username: 'anderson',
        password: 'test@1234',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).not.toBeNull();

      const accessTokenParts = result.accessToken.split('.');
      expect(accessTokenParts.length).toBe(3);
    });

    test('correct login data with INACTIVE user', async () => {
      try {
        await controller.login({
          username: 'thomas',
          password: 'test@1234',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    test('incorrect login data', async () => {
      try {
        await controller.login({
          username: 'anderson',
          password: 'test@5678',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    test('incorrect login data', async () => {
      try {
        await controller.login({
          username: 'beatrice',
          password: 'test@1234',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    test('some database error', async () => {
      try {
        await controller.login({
          username: 'anything',
          password: 'test@1234',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(BadGatewayException);
      }
    });
  });
});
