import request from 'supertest';
import jsonwebtoken from 'jsonwebtoken';
import { getContainerRuntimeClient } from 'testcontainers';
import { UserPayload } from '@shared/authentication/payloads/user.payload';

describe('POST /auth/verify', () => {
  let host: string;
  const endpoint = '/auth/verify';
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

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

  test('valid', async () => {
    const now = Math.floor(Date.now() / 1000);
    const refreshToken = jsonwebtoken.sign(
      {
        userId: '4799cc31-7692-40b3-afff-cc562baf5374',
        loginId: new Date().getTime().toString(),
        role: 'user',
        iat: now,
        exp: now + 60,
      } as UserPayload,
      JWT_SECRET_KEY,
    );

    await request(host)
      .get(endpoint)
      .set('Authorization', `Bearer ${refreshToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body).toHaveProperty('valid');
        expect(body.valid).toBeTruthy();
        expect(body).not.toHaveProperty('invalidatedBy');
      });
  });

  test('invalid by logout', async () => {
    const now = Math.floor(Date.now() / 1000);
    const refreshToken = jsonwebtoken.sign(
      {
        userId: '4799cc31-7692-40b3-afff-cc562baf5375',
        loginId: '1731355542035',
        role: 'user',
        iat: now,
        exp: now + 60,
      } as UserPayload,
      JWT_SECRET_KEY,
    );

    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCache = await containerRuntimeClient.container.fetchByLabel(
      'poc-nestjs-name',
      'auth-service-cache',
    );

    await containerRuntimeClient.container.exec(containerCache, [
      'redis-cli',
      'SET',
      'auth:logout:4799cc31-7692-40b3-afff-cc562baf5375:1731355542035',
      '{}',
    ]);

    await request(host)
      .get(endpoint)
      .set('Authorization', `Bearer ${refreshToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body).toHaveProperty('valid');
        expect(body.valid).toBeFalsy();
        expect(body.invalidatedBy).toBe('logout');
      });
  });

  test('invalid by password change', async () => {
    const now = Math.floor(Date.now() / 1000);
    const refreshToken = jsonwebtoken.sign(
      {
        userId: '4799cc31-7692-40b3-afff-cc562baf5376',
        loginId: '1731355542036',
        role: 'user',
        iat: now,
        exp: now + 60,
      } as UserPayload,
      JWT_SECRET_KEY,
    );

    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCache = await containerRuntimeClient.container.fetchByLabel(
      'poc-nestjs-name',
      'auth-service-cache',
    );

    await containerRuntimeClient.container.exec(containerCache, [
      'redis-cli',
      'SET',
      'auth:password:4799cc31-7692-40b3-afff-cc562baf5376',
      `{changedAt: ${Date.now()}}`,
    ]);

    await request(host)
      .get(endpoint)
      .set('Authorization', `Bearer ${refreshToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body).toHaveProperty('valid');
        expect(body.valid).toBeFalsy();
        expect(body.invalidatedBy).toBe('password');
      });
  });
});
