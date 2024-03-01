/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserAuthsRepository } from './repositories/user-auths/user-auths.repository';
import { UserAuthsRepositoryMock } from './mocks/user-auths-repository.mock';
import { JwtService } from '@nestjs/jwt';
import { BadGatewayException, ConflictException, Logger, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserAuthEntity } from '@shared/database/authentication/entities/user-auth.entity';
import { UserPayload } from '@shared/authentication/payloads/user.payload';
import { AuthErrorNames } from '@shared/authentication/enums/auth-error-names.enum';
import { AuthErrorMessages } from '@shared/authentication/enums/auth-error-messages.enum';

describe('auth.service', () => {
  let service: AuthService;
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
  const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        UserAuthsRepository,
        Logger,
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

  describe('verifyIfUsernameExists()', () => {
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

  describe('signup()', () => {
    test('username already registered', async () => {
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

    test('userId already registered', async () => {
      try {
        await service.signup(
          'c3914f88-9a70-4775-9e32-7bcc8fbaeaaa',
          'nathan',
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

  describe('login()', () => {
    test('correct login data with ACTIVE user (with refresh)', async () => {
      const result = await service.login('anderson', 'test@1234', true, '', '');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      
      const accessToken = jsonwebtoken.verify(result.accessToken, process.env.JWT_SECRET_KEY) as JwtPayload;
      expect(accessToken).toHaveProperty('userId');
      expect(accessToken.userId).toBe('4b3c74ae-57aa-4752-9452-ed083b6d4bfa');
      expect(accessToken).toHaveProperty('loginId');
      expect(parseInt(accessToken.loginId)).toBeLessThan(new Date().getTime());

      const refreshToken = jsonwebtoken.verify(result.refreshToken, process.env.JWT_REFRESH_SECRET_KEY) as JwtPayload;
      expect(refreshToken).toHaveProperty('userId');
      expect(refreshToken.userId).toBe('4b3c74ae-57aa-4752-9452-ed083b6d4bfa');
      expect(refreshToken).toHaveProperty('loginId');
      expect(parseInt(refreshToken.loginId)).toBeLessThan(new Date().getTime());
    });

    test('correct login data with ACTIVE user (without refresh)', async () => {
      const result = await service.login('anderson', 'test@1234', false, '', '');

      expect(result).toHaveProperty('accessToken');
      expect(result).not.toHaveProperty('refreshToken');
      
      const accessToken = jsonwebtoken.verify(result.accessToken, process.env.JWT_SECRET_KEY) as JwtPayload;
      expect(accessToken).toHaveProperty('userId');
      expect(accessToken.userId).toBe('4b3c74ae-57aa-4752-9452-ed083b6d4bfa');
      expect(accessToken).toHaveProperty('loginId');
      expect(parseInt(accessToken.loginId)).toBeLessThan(new Date().getTime());
    });

    test('correct login data with INACTIVE user', async () => {
      try {
        await service.login('thomas', 'test@1234', true, '', '');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    test('incorrect login data (user exists)', async () => {
      try {
        await service.login('anderson', 'test@5678', true, '', '');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    test('incorrect login data (user does not exists)', async () => {
      try {
        await service.login('beatrice', 'test@1234', true, '', '');
      } catch (error) {
        console.log(error);
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    test('some database error', async () => {
      try {
        await service.login('anything', 'test@1234', true, '', '');
      } catch (error) {
        expect(error).toBeInstanceOf(BadGatewayException);
      }
    });
  });

  describe('refresh()', () => {
    test('correct token data with ACTIVE user', async () => {
      const user = {
        userId: '4b3c74ae-57aa-4752-9452-ed083b6d4bfa',
        loginId: new Date().getTime().toString(),
      } as UserPayload;

      const result = await service.refresh(user);

      expect(result).toHaveProperty('accessToken');
      expect(result).not.toHaveProperty('refreshToken');

      const accessToken = jsonwebtoken.verify(result.accessToken, process.env.JWT_SECRET_KEY) as JwtPayload;
      expect(accessToken).toHaveProperty('userId');
      expect(accessToken.userId).toBe('4b3c74ae-57aa-4752-9452-ed083b6d4bfa');
      expect(accessToken).toHaveProperty('loginId');
      expect(parseInt(accessToken.loginId)).toBeLessThan(new Date().getTime());
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

  describe('logout()', () => {
    test('INACTIVE user', async () => {
      const user = {
        userId: '4b3c74ae-57aa-4752-9452-ed083b6d4b04',
        loginId: new Date().getTime().toString(),
      } as UserPayload;

      try {
        await service.logout(user.userId, user.loginId);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        const response = error.response;
        expect(response).toHaveProperty('data');
        expect(response.data.name).toBe(AuthErrorNames.JWT_INVALIDATED_BY_SERVER);
        expect(response.data.errors).toEqual(expect.arrayContaining([AuthErrorMessages.INACTIVE_USER]));
      }
    });

    test('ACTIVE user', async () => {
      const user = {
        userId: '4b3c74ae-57aa-4752-9452-ed083b6d4bfa',
        loginId: new Date().getTime().toString(),
      } as UserPayload;

      const result = await service.logout(user.userId, user.loginId);
      
      expect(result.performed).toBeTruthy();
      expect(result).toHaveProperty('performedAt');
    });
  });

  describe('passwordChange()', () => {
    test('inactive user', async () => {
      const loginId = new Date().getTime().toString();
      const user = {
        userId: 'fcf5cccf-c217-4502-8cc3-cc24270ae0b7',
        loginId,
      } as UserPayload;

      try {
        await service.passwordChange(user.userId, loginId, 'test@1234', '1234@test', true, '', '');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        const response = error.response;
        expect(response).toHaveProperty('data');
        expect(response.data.name).toBe(AuthErrorNames.CREDENTIAL_ERROR);
        expect(response.data.errors).toEqual(expect.arrayContaining([AuthErrorMessages.INACTIVE_USER]));
      }
    });

    test('user does not exist', async () => {
      const loginId = new Date().getTime().toString();
      const user = {
        userId: '4b3c74ae-57aa-4752-9452-ed083b6d4345',
        loginId,
      } as UserPayload;

      try {
        await service.passwordChange(user.userId, loginId, 'test@1234', '1234@test', true, '', '');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        const response = error.response;
        expect(response).toHaveProperty('data');
        expect(response.data.name).toBe(AuthErrorNames.CREDENTIAL_ERROR);
        expect(response.data.errors).toEqual(expect.arrayContaining([AuthErrorMessages.INACTIVE_USER]));
      }
    });

    test('incorrect password', async () => {
      const loginId = new Date().getTime().toString();
      const user = {
        userId: '4b3c74ae-57aa-4752-9452-ed083b6d4bfa',
        loginId,
      } as UserPayload;

      try {
        await service.passwordChange(user.userId, loginId, '1234@1234', '1234@test', true, '', '');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        const response = error.response;
        expect(response).toHaveProperty('data');
        expect(response.data.name).toBe(AuthErrorNames.CREDENTIAL_ERROR);
        expect(response.data.errors).toEqual(expect.arrayContaining([AuthErrorMessages.WRONG_USER_PASSWORD]));
      }
    });

    test('perfomed without errors (with refresh token)', async () => {
      const loginId = new Date().getTime().toString();
      const user = {
        userId: '4b3c74ae-57aa-4752-9452-ed083b6d4bfa',
        loginId,
      } as UserPayload;

      const result = await service.passwordChange(user.userId, loginId, 'test@1234', '1234@test', true, '', '');
      
      expect(result.performed).toBeTruthy();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');

      const accessToken = jsonwebtoken.verify(result.accessToken, JWT_SECRET_KEY) as JwtPayload;
      const refreshToken = jsonwebtoken.verify(result.refreshToken, JWT_REFRESH_SECRET_KEY) as JwtPayload;

      expect(accessToken.loginId).toBe(loginId);
      expect(refreshToken.loginId).toBe(loginId);
    });

    test('perfomed without errors (without refresh token)', async () => {
      const loginId = new Date().getTime().toString();
      const user = {
        userId: '4b3c74ae-57aa-4752-9452-ed083b6d4bfa',
        loginId,
      } as UserPayload;

      const result = await service.passwordChange(user.userId, loginId, 'test@1234', '1234@test', false, '', '');
      
      expect(result.performed).toBeTruthy();
      expect(result).toHaveProperty('accessToken');
      expect(result).not.toHaveProperty('refreshToken');

      const accessToken = jsonwebtoken.verify(result.accessToken, JWT_SECRET_KEY) as JwtPayload;

      expect(accessToken.loginId).toBe(loginId);
    });
  });

  describe('convertStringToSeconds()', () => {
    test('with d (days)', () => {
      const seconds = service.convertStringToSeconds('2d');

      expect(seconds).toBe(172800);
    });

    test('with h (hours)', () => {
      const seconds = service.convertStringToSeconds('4h');

      expect(seconds).toBe(14400);
    });

    test('with m (minutes)', () => {
      const seconds = service.convertStringToSeconds('5m');

      expect(seconds).toBe(300);
    });

    test('with invalid letter', () => {
      const seconds = service.convertStringToSeconds('2x');

      expect(seconds).toBe(2);
    });
  });
});
