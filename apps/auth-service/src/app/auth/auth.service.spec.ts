/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserAuthsRepository } from './repositories/user-auths/user-auths.repository';
import { UserAuthsRepositoryMock } from './mocks/user-auths-repository.mock';
import { JwtService } from '@nestjs/jwt';
import { BadGatewayException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserAuthEntity } from '@shared/database/authentication/entities/user-auth.entity';
import { UserPayload } from '@shared/authentication/payloads/user.payload';
import { AUTHENTICATION_ERROR } from '@shared/authentication/enums/authentication-error.enum';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        UserAuthsRepository,
        {
          provide: getRepositoryToken(UserAuthEntity),
          useClass: UserAuthsRepositoryMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            set: (key, value) => {},
          }
        }
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

  describe('auth.service -> login()', () => {
    test('correct login data with ACTIVE user', async () => {
      const result = await service.login('anderson', 'test@1234');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      
      const accessToken = jsonwebtoken.verify(result.accessToken, process.env.JWT_SECRET_KEY) as JwtPayload;
      expect(accessToken).toHaveProperty('userId');
      expect(accessToken.userId).toBe('4b3c74ae-57aa-4752-9452-ed083b6d4bfa');
      expect(accessToken).toHaveProperty('iss');
      expect(accessToken.iss).toBeLessThan(new Date().getTime());

      const refreshToken = jsonwebtoken.verify(result.refreshToken, process.env.JWT_REFRESH_SECRET_KEY) as JwtPayload;
      expect(refreshToken).toHaveProperty('userId');
      expect(refreshToken.userId).toBe('4b3c74ae-57aa-4752-9452-ed083b6d4bfa');
      expect(refreshToken).toHaveProperty('iss');
      expect(refreshToken.iss).toBeLessThan(new Date().getTime());
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

    test('incorrect login data (user does not exists)', async () => {
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
      expect(result).not.toHaveProperty('refreshToken');

      const accessToken = jsonwebtoken.verify(result.accessToken, process.env.JWT_SECRET_KEY) as JwtPayload;
      expect(accessToken).toHaveProperty('userId');
      expect(accessToken.userId).toBe('4b3c74ae-57aa-4752-9452-ed083b6d4bfa');
      expect(accessToken).toHaveProperty('iss');
      expect(accessToken.iss).toBeLessThan(new Date().getTime());
    });

    test('correct login data with INACTIVE user', async () => {
      const user = {
        userId: '4b3c74ae-57aa-4752-9452-ed083b6d4b04',
      } as UserPayload;

      try {
        await service.refresh(user);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('auth.service -> logout()', () => {
    test('INACTIVE user', async () => {
      const user = {
        userId: '4b3c74ae-57aa-4752-9452-ed083b6d4b04',
        iss: new Date().getTime(),
      } as UserPayload;

      try {
        await service.logout(user.userId, user.iss);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        const response = error.response;
        expect(response).toHaveProperty('data');
        expect(response.data.name).toBe(AUTHENTICATION_ERROR.TokenInvalidatedByServer);
        expect(response.data.errors).toEqual(expect.arrayContaining(['user is inactive']));
      }
    });

    test('ACTIVE user', async () => {
      const user = {
        userId: '4b3c74ae-57aa-4752-9452-ed083b6d4bfa',
        iss: new Date().getTime(),
      } as UserPayload;

      const result = await service.logout(user.userId, user.iss);
      
      expect(result.performed).toBeTruthy();
      expect(result).toHaveProperty('performedAt');
    });
  });
});
