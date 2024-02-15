import { Test, TestingModule } from '@nestjs/testing';
import { TestBed } from '@automock/jest';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { CacheManagerMock } from './mocks/cache-manager.mock';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeAll(() => {
    const { unit, unitRef } = TestBed.create(AuthGuard)
      .mock(CACHE_MANAGER).using(CacheManagerMock)
      .compile();

    guard = unit;
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