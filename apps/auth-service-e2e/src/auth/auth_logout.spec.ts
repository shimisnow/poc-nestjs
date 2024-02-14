import request from 'supertest';
import jsonwebtoken from 'jsonwebtoken';
import { getContainerRuntimeClient } from 'testcontainers';
import { UserPayload } from '@shared/authentication/payloads/user.payload';

describe('POST /auth/logout', () => {
  let host: string;
  const endpoint = '/auth/logout';
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCode = await containerRuntimeClient.container.fetchByLabel('poc-nestjs-name', 'auth-service-code');
    const containerInfo = await containerCode.inspect();
    const AUTH_SERVICE_TEST_PORT = containerInfo.NetworkSettings.Ports[`${process.env.AUTH_SERVICE_PORT}/tcp`][0].HostPort;
    host = `http://localhost:${AUTH_SERVICE_TEST_PORT}`;
  });

  test('logout without errors', async () => {
    const now = Math.floor(Date.now() / 1000);
    const refreshToken = jsonwebtoken.sign({
      userId: '4799cc31-7692-40b3-afff-cc562baf5374',
      loginId: new Date().getTime().toString(),
      iat: now,
      exp: now + 60,
    } as UserPayload, JWT_SECRET_KEY);

    await request(host)
      .post(endpoint)
      .set('Authorization', `Bearer ${refreshToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body).toHaveProperty('performed');
        expect(body.performed).toBeTruthy();
        expect(body).toHaveProperty('performedAt');
      });
  });

  test('logout error for user already logged out', async () => {
    const now = Math.floor(Date.now() / 1000);
    const refreshToken = jsonwebtoken.sign({
      userId: '4b9cf2b7-1601-47a5-9668-6cb423b0d7ac',
      loginId: '1707755084516',
      iat: now,
      exp: now + 60,
    } as UserPayload, JWT_SECRET_KEY);

    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCache = await containerRuntimeClient.container.fetchByLabel('poc-nestjs-name', 'auth-service-cache');

    await containerRuntimeClient.container.exec(
      containerCache,
      ['redis-cli', 'SET', 'auth:logout:4b9cf2b7-1601-47a5-9668-6cb423b0d7ac:1707755084516', '{}']
    );

    await request(host)
      .post(endpoint)
      .set('Authorization', `Bearer ${refreshToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(401)
      .then(response => {
        const body = response.body;
        expect(body.data.name).toBe('TokenInvalidatedByServer');
        expect(body.data.errors).toEqual(expect.arrayContaining(['invalidated by logout']));
      }); 
  });
});