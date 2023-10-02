/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserAuthsRepository } from './repositories/user-auths/user-auths.repository';
import { UserAuthsRepositoryMock } from './mocks/user-auths-repository.mock';
import {
  BadGatewayException,
  ConflictException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
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

    test('incorrect login data (user exists)', async () => {
      try {
        await controller.login({
          username: 'anderson',
          password: 'test@5678',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    test('incorrect login data (user do not exists)', async () => {
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

  describe('auth.controller -> signup()', () => {
    test('user CAN be created', async () => {
      const result = await controller.signup({
        userId: '0b652c07-613f-48c7-8f60-d7e1f9392255',
        username: 'anderson',
        password: 'test@1234',
      });

      expect(result).toHaveProperty('status');
      expect(result.status).toBeTruthy();
    });

    test('user CANNOT be created (duplicated)', async () => {
      try {
        await controller.signup({
          userId: 'd41ac12c-e1ba-46ab-9912-8286c03164a7',
          username: 'thomas',
          password: 'test@1234',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    test('user CANNOT be created (database error)', async () => {
      try {
        await controller.signup({
          userId: 'af0cf233-0e08-459f-a97e-c3e479c67371',
          username: 'jonas',
          password: 'test@1234',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
      }
    });

    test('user CANNOT be created (entity database error)', async () => {
      try {
        await controller.signup({
          userId: 'efadd10d-fa86-4bca-a926-e52d7fe6fe28',
          username: 'marta',
          password: 'test@1234',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(BadGatewayException);
      }
    });
  });
});
