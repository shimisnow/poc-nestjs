import request from 'supertest';
import jsonwebtoken from 'jsonwebtoken';
import { getContainerRuntimeClient } from 'testcontainers';
import { AuthErrorNames } from '@shared/authentication/enums/auth-error-names.enum';
import { AuthErrorMessages } from '@shared/authentication/enums/auth-error-messages.enum';
import { UserPayload } from '@shared/authentication/payloads/user.payload';

describe('POST /auth/refresh', () => {
  let host: string;
  const endpoint = '/auth/refresh';
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
  const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCode = await containerRuntimeClient.container.fetchByLabel(
      'poc-nestjs-name',
      'auth-service-code',
    );
    const containerInfo = await containerCode.inspect();
    const AUTH_SERVICE_TEST_PORT =
      containerInfo.NetworkSettings.Ports[
        `${process.env.AUTH_SERVICE_PORT}/tcp`
      ][0].HostPort;
    host = `http://localhost:${AUTH_SERVICE_TEST_PORT}`;
  });

  describe('authentication errors', () => {
    test('User is inactive', async () => {
      const now = Math.floor(Date.now() / 1000);
      const refreshToken = jsonwebtoken.sign(
        {
          userId: '10f88251-d181-4255-92ed-d0d874e3a166',
          loginId: new Date().getTime().toString(),
          iat: now,
          exp: now + 60,
        } as UserPayload,
        JWT_REFRESH_SECRET_KEY,
      );

      await request(host)
        .get(endpoint)
        .set('Authorization', `Bearer ${refreshToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then((response) => {
          const body = response.body;
          expect(body.data.name).toBe(AuthErrorNames.CREDENTIAL_ERROR);
          expect(body.data.errors).toEqual(
            expect.arrayContaining([AuthErrorMessages.INACTIVE_USER]),
          );
        });
    });
  });

  describe('request without errors', () => {
    test('User is active (correct password)', async () => {
      const now = Math.floor(Date.now() / 1000);
      const refreshToken = jsonwebtoken.sign(
        {
          userId: '4799cc31-7692-40b3-afff-cc562baf5374',
          loginId: new Date().getTime().toString(),
          iat: now,
          exp: now + 60,
        } as UserPayload,
        JWT_REFRESH_SECRET_KEY,
      );

      const response = await request(host)
        .get(endpoint)
        .set('Authorization', `Bearer ${refreshToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body;

      expect(body).toHaveProperty('accessToken');
      // throws "JsonWebTokenError: invalid signature" if token is invalid
      jsonwebtoken.verify(body.accessToken, JWT_SECRET_KEY);
    });
  });
});
