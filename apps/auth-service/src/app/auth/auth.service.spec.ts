/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserAuthsRepository } from './repositories/user-auths/user-auths.repository';
import { UserAuthsRepositoryMock } from './mocks/user-auths-repository.mock';
import { JwtService } from '@nestjs/jwt';
import { BadGatewayException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserAuthEntity } from '@shared/database/authentication/entities/user-auth.entity';
import { UserPayload } from '@shared/authentication/payloads/user.payload';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserAuthsRepository,
        {
          provide: getRepositoryToken(UserAuthEntity),
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

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('auth.service -> verifyIfUsernameExists()', () => {
    test('username already registered', async () => {
      const result = await service.verifyIfUsernameExists('anderson');

      expect(result).toBeTruthy();
    });

    test('username not registered', async () => {
      const result = await service.verifyIfUsernameExists('beatrice');
  
      expect(result).toBeFalsy();
    });
  
    test('some database error', async () => {
      try {
        await service.verifyIfUsernameExists('anything');
      } catch (error) {
        expect(error).toBeInstanceOf(BadGatewayException);
      }
    });
  });

  describe('auth.service -> login()', () => {
    test('correct login data with ACTIVE user', async () => {
      const result = await service.login('anderson', 'test@1234');

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).not.toBeNull();
      expect(result).toHaveProperty('refreshToken');
      expect(result.refreshToken).not.toBeNull();
      expect(result.accessToken.split('.').length).toBe(3);
      expect(result.refreshToken.split('.').length).toBe(3);
    });

    test('correct login data with INACTIVE user', async () => {
      try {
        await service.login('thomas', 'test@1234');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    test('incorrect login data (user exists)', async () => {
      try {
        await service.login('anderson', 'test@5678');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    test('incorrect login data (user do not exists)', async () => {
      try {
        await service.login('beatrice', 'test@1234');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    test('some database error', async () => {
      try {
        await service.login('anything', 'test@1234');
      } catch (error) {
        expect(error).toBeInstanceOf(BadGatewayException);
      }
    });
  });

  describe('auth.service -> refresh()', () => {
    test('correct token data with ACTIVE user', async () => {
      const user = {
        userId: '4b3c74ae-57aa-4752-9452-ed083b6d4bfa',
      } as UserPayload;

      const result = await service.refresh(user);

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).not.toBeNull();
      expect(result).not.toHaveProperty('refreshToken');
    });
  });

  describe('auth.service -> signup()', () => {
    test('username/userId already registered', async () => {
      try {
        await service.signup(
          'c3914f88-9a70-4775-9e32-7bcc8fbaeccd',
          'thomas',
          ''
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    test('insert without errors', async () => {
      const result = await service.signup(
        '4b3c74ae-57aa-4752-9452-ed083b6d4bfa',
        'anderson',
        ''
      );

      expect(result.status).toBeTruthy();
    });
  });
});
