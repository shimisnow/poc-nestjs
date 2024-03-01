import request from 'supertest';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { getContainerRuntimeClient } from 'testcontainers';
import { AuthErrorNames } from '@shared/authentication/enums/auth-error-names.enum';
import { AuthErrorMessages } from '@shared/authentication/enums/auth-error-messages.enum';
import { CacheKeyPrefix } from '@shared/cache/enums/cache-key-prefix.enum';
import { UserPayload } from '@shared/authentication/payloads/user.payload';

describe('POST /auth/password', () => {
  let host: string;
  const endpoint = '/auth/password';
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
  const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCode = await containerRuntimeClient.container.fetchByLabel('poc-nestjs-name', 'auth-service-code');
    const containerInfo = await containerCode.inspect();
    const AUTH_SERVICE_TEST_PORT = containerInfo.NetworkSettings.Ports[`${process.env.AUTH_SERVICE_PORT}/tcp`][0].HostPort;
    host = `http://localhost:${AUTH_SERVICE_TEST_PORT}`;
  });

  describe('authentication errors', () => {
    test('user does not exists', async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = jsonwebtoken.sign({
        userId: '4799cc31-7692-40b3-afff-cc562baf5667',
        loginId: new Date().getTime().toString(),
        iat: now,
        exp: now + 60,
      } as UserPayload, JWT_SECRET_KEY);

      await request(host)
        .post(endpoint)
        .send({
          currentPassword: 'test@1234',
          newPassword: '1234@test',
        })
        .set('Authorization', `Bearer ${token}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then(response => {
          const body = response.body;
          expect(body.data.name).toBe(AuthErrorNames.CREDENTIAL_ERROR);
          expect(body.data.errors).toEqual(expect.arrayContaining([AuthErrorMessages.INACTIVE_USER]));
        });
    });

    test('user exists but it is inactive', async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a166',
        loginId: new Date().getTime().toString(),
        iat: now,
        exp: now + 60,
      } as UserPayload, JWT_SECRET_KEY);

      await request(host)
        .post(endpoint)
        .send({
          currentPassword: 'test@1234',
          newPassword: '1234@test',
        })
        .set('Authorization', `Bearer ${token}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then(response => {
          const body = response.body;
          expect(body.data.name).toBe(AuthErrorNames.CREDENTIAL_ERROR);
          expect(body.data.errors).toEqual(expect.arrayContaining([AuthErrorMessages.INACTIVE_USER]));
        });
    });

    test('request with wrong password', async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = jsonwebtoken.sign({
        userId: '07389621-d2da-468a-a692-05824dd46aab',
        loginId: new Date().getTime().toString(),
        iat: now,
        exp: now + 60,
      } as UserPayload, JWT_SECRET_KEY);

      await request(host)
        .post(endpoint)
        .send({
          currentPassword: '1234test',
          newPassword: '1234@test',
        })
        .set('Authorization', `Bearer ${token}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then(response => {
          const body = response.body;
          expect(body.data.name).toBe(AuthErrorNames.CREDENTIAL_ERROR);
          expect(body.data.errors).toEqual(expect.arrayContaining([AuthErrorMessages.WRONG_USER_PASSWORD]));
        });
    });
  });

  describe('request without errors', () => {
    test('performed without errors', async () => {
      const userId = '07389621-d2da-468a-a692-05824dd46aab';
      const loginId = new Date().getTime().toString();

      const now = Math.floor(Date.now() / 1000);
      const token = jsonwebtoken.sign({
        userId,
        loginId,
        iat: now,
        exp: now + 60,
      } as UserPayload, JWT_SECRET_KEY);

      const response = await request(host)
        .post(endpoint)
        .send({
          currentPassword: 'test@1234',
          newPassword: '1234@test',
          requestRefreshToken: true,
        })
        .set('Authorization', `Bearer ${token}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body;

      expect(body).toHaveProperty('performed');
      expect(body.performed).toBeTruthy();

      const accessToken = jsonwebtoken.verify(body.accessToken, JWT_SECRET_KEY) as JwtPayload;
      const refreshToken = jsonwebtoken.verify(body.refreshToken, JWT_REFRESH_SECRET_KEY) as JwtPayload;

      expect(accessToken.userId).toBe(userId);
      expect(accessToken.loginId).toBe(loginId);
      expect(refreshToken.userId).toBe(userId);
      expect(refreshToken.loginId).toBe(loginId);

      const containerRuntimeClient = await getContainerRuntimeClient();
      const containerCache = await containerRuntimeClient.container.fetchByLabel('poc-nestjs-name', 'auth-service-cache');

      const cacheResult = await containerRuntimeClient.container.exec(
        containerCache,
        ['redis-cli', 'GET', `${CacheKeyPrefix.AUTH_PASSWORD_CHANGE}:${userId}`]
      );

      const cacheValue = JSON.parse(cacheResult.output);

      // * 1000 to convert it from seconds to milliseconds
      expect(accessToken.iat * 1000).toBeGreaterThan(cacheValue.changedAt);
      expect(refreshToken.iat * 1000).toBeGreaterThan(cacheValue.changedAt);
    });
  });
});
