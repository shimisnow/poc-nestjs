/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserAuthsRepository } from './repositories/user-auths/user-auths.repository';
import { UserAuthsRepositoryMock } from './mocks/user-auths-repository.mock';
import { BadGatewayException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    test('username NOT registered', async () => {
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
});
