/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import * as jsonwebtoken from 'jsonwebtoken';
import { AuthGuard } from './auth.guard';
import { CacheManagerMock } from './mocks/cache-manager.mock';
import { UnauthorizedException } from '@nestjs/common';
import { AuthErrorNames } from '../enums/auth-error-names.enum';
import { AuthErrorMessages } from '../enums/auth-error-messages.enum';
import { UserPayload } from '../payloads/user.payload';

const generateContext = (authToken: string) => {
  const context = {
    switchToHttp: () => {
      return {
        getRequest: () => {
          return {
            headers: {
              authorization: `Bearer ${authToken}`,
            },
          };
        }
      };
    }
  };

  return context;
};

describe('AuthGuard', () => {
  let guard: AuthGuard;
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        JwtService,
        {
          provide: CACHE_MANAGER,
          useClass: CacheManagerMock,
        }
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  describe('AuthGuard.canActivate()', () => {
    test('empty token', async () => {
      try {
        await guard.canActivate(generateContext('') as any);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        const response = error.response;
        expect(response).toHaveProperty('data');
        expect(response.data.name).toBe(AuthErrorNames.JWT_EMPTY_ERROR);
      }
    });

    test('invalid jwt token', async () => {
      try {
        await guard.canActivate(generateContext('abcdefghijklmnopqrstuvwxyz') as any);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        const response = error.response;
        expect(response).toHaveProperty('data');
        expect(response.data.name).toBe(AuthErrorNames.JWT_ERROR);
        expect(response.data.errors).toEqual(expect.arrayContaining(['jwt malformed']));
      }
    });

    test('invalid jwt token signature', async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = jsonwebtoken.sign({
        userId: '4799cc31-7692-40b3-afff-cc562baf5374',
        loginId: new Date().getTime().toString(),
        iat: now,
        exp: now + 60,
      } as UserPayload, 'fake-key');

      try {
        await guard.canActivate(generateContext(token) as any);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        const response = error.response;
        expect(response).toHaveProperty('data');
        expect(response.data.name).toBe(AuthErrorNames.JWT_ERROR);
        expect(response.data.errors).toEqual(expect.arrayContaining(['invalid signature']));
      }
    });

    test('payload with incorrect structure', async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = jsonwebtoken.sign({
        userId: '4799cc31-7692-40b3-afff-cc562baf5374',
        iat: now,
        exp: now + 60,
      } as UserPayload, JWT_SECRET_KEY);

      try {
        await guard.canActivate(generateContext(token) as any);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        const response = error.response;
        expect(response).toHaveProperty('data');
        expect(response.data.name).toBe(AuthErrorNames.JWT_PAYLOAD_STRUCTURE_ERROR);
        expect(response.data.errors).toEqual(expect.arrayContaining(['loginId must be a number string']));
      }
    });

    test('invalidated by user logout', async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = jsonwebtoken.sign({
        // user in cache for logout
        userId: '01e57c05-45d6-4d6f-8f30-2bddce37df5f',
        loginId: '1708003432088',
        iat: now,
        exp: now + 60,
      } as UserPayload, JWT_SECRET_KEY);

      try {
        await guard.canActivate(generateContext(token) as any);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        const response = error.response;
        expect(response).toHaveProperty('data');
        expect(response.data.name).toBe(AuthErrorNames.JWT_INVALIDATED_BY_SERVER);
        expect(response.data.errors).toEqual(expect.arrayContaining([AuthErrorMessages.INVALIDATED_BY_LOGOUT]));
      }
    });

    test('invalidated by user password change', async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = jsonwebtoken.sign({
        // user in cache for password change
        userId: '3e699250-4bc4-4c3d-a0ea-0aa3dc17abd5',
        loginId: new Date().getTime().toString(),
        iat: 1708003432,
        exp: now + 60,
      } as UserPayload, JWT_SECRET_KEY);

      try {
        await guard.canActivate(generateContext(token) as any);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        const response = error.response;
        expect(response).toHaveProperty('data');
        expect(response.data.name).toBe(AuthErrorNames.JWT_INVALIDATED_BY_SERVER);
        expect(response.data.errors).toEqual(expect.arrayContaining([AuthErrorMessages.INVALIDATED_BY_PASSWORD_CHANGE]));
      }
    });

    test('token issued after password change', async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = jsonwebtoken.sign({
        // user in cache for password change
        userId: '3e699250-4bc4-4c3d-a0ea-0aa3dc17abd5',
        loginId: new Date().getTime().toString(),
        iat: now,
        exp: now + 60,
      } as UserPayload, JWT_SECRET_KEY);

      const result = await guard.canActivate(generateContext(token) as any);
      expect(result).toBeTruthy();
    });

    test('token without events', async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = jsonwebtoken.sign({
        // user not in cache
        userId: '68ec369c-30f3-4e56-b286-290cde1efd7c',
        loginId: new Date().getTime().toString(),
        iat: now,
        exp: now + 60,
      } as UserPayload, JWT_SECRET_KEY);

      const result = await guard.canActivate(generateContext(token) as any);
      expect(result).toBeTruthy();
    });
  });

  describe('AuthGuard.extractTokenFromHeader()', () => {
    // necessary to access the private mothod
    const guard = new AuthGuard(null, null) as any;

    test('empty authorization header', async () => {
      const authHeader = {
        headers: {
          authorization: '',
        }
      }

      const result = guard.extractTokenFromHeader(authHeader);

      expect(result).toBeUndefined();
    });

    test('authorization header different than Bearer', async () => {
      const authHeader = {
        headers: {
          authorization: 'Header eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        }
      }

      const result = guard.extractTokenFromHeader(authHeader);

      expect(result).toBeUndefined();
    });

    test('Bearer authorization header with empty token', async () => {
      const authHeader = {
        headers: {
          authorization: 'Bearer',
        }
      }

      const result = guard.extractTokenFromHeader(authHeader);

      expect(result).toBeUndefined();
    });

    test('correct authorization header', async () => {
      const authHeader = {
        headers: {
          authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        }
      }

      const result = guard.extractTokenFromHeader(authHeader);

      expect(result).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });
  });
});
