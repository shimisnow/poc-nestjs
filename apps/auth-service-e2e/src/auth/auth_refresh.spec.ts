import request from 'supertest';
import jsonwebtoken from 'jsonwebtoken';
import { getContainerRuntimeClient } from 'testcontainers';

describe('POST /auth/refresh', () => {
  let host: string;
  const endpoint = '/auth/refresh';
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
    test('User does not exists', async () => {
      const now = Math.floor(Date.now() / 1000);
      const refreshToken = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a177',
        iss: new Date().getTime(),
        iat: now,
        exp: now + 60,
      }, JWT_REFRESH_SECRET_KEY);

      await request(host)
        .get(endpoint)
        .set('Authorization', `Bearer ${refreshToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then(response => {
          const body = response.body;
          expect(body.data.name).toBe('UserPasswordError');
          expect(body.data.errors).toEqual(expect.arrayContaining(['user is inactive or does not exists']));
        });
    });

    test('User exists but it is inactive', async () => {
      const now = Math.floor(Date.now() / 1000);
      const refreshToken = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a166',
        iss: new Date().getTime(),
        iat: now,
        exp: now + 60,
      }, JWT_REFRESH_SECRET_KEY);
      
      await request(host)
        .get(endpoint)
        .set('Authorization', `Bearer ${refreshToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then(response => {
          const body = response.body;
          expect(body.data.name).toBe('UserPasswordError');
          expect(body.data.errors).toEqual(expect.arrayContaining(['user is inactive or does not exists']));
        });
    });
  });

  describe('request without errors', () => {
    test('User is active (correct password)', async () => {
      const now = Math.floor(Date.now() / 1000);
      const refreshToken = jsonwebtoken.sign({
        userId: '4799cc31-7692-40b3-afff-cc562baf5374',
        iss: new Date().getTime(),
        iat: now,
        exp: now + 60,
      }, JWT_REFRESH_SECRET_KEY);

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
