import { CacheKeyPrefix } from '@shared/cache/enums/cache-key-prefix.enum';
import { verify } from 'crypto';
import request from 'supertest';
import { getContainerRuntimeClient } from 'testcontainers';

describe('POST /auth/verify', () => {
  let host: string;
  const endpoint = '/auth/verify';

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
    const userId = '4799cc31-7692-40b3-afff-cc562baf5374';
    const loginId = new Date().getTime().toString();
    const iat = Math.floor(Date.now() / 1000);

    await request(host)
      .post(endpoint)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .send({
        userId,
        loginId,
        iat,
      })
      .then((response) => {
        const body = response.body;
        expect(body).toHaveProperty('valid');
        expect(body.valid).toBeTruthy();
        expect(body).not.toHaveProperty('invalidatedBy');
      });
  });

  test('invalid by logout', async () => {
    const userId = '4799cc31-7692-40b3-afff-cc562baf5375';
    const loginId = '1731355542035';
    const iat = Math.floor(Date.now() / 1000);

    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCache = await containerRuntimeClient.container.fetchByLabel(
      'poc-nestjs-name',
      'auth-service-cache',
    );

    await containerRuntimeClient.container.exec(containerCache, [
      'redis-cli',
      'SET',
      [CacheKeyPrefix.AUTH_SESSION_LOGOUT, userId, loginId].join(':'),
      JSON.stringify({
        value: {
          performedAt: new Date().getTime(),
          expires: new Date().getTime() + 60000,
        },
      }),
    ]);

    await request(host)
      .post(endpoint)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .send({
        userId,
        loginId,
        iat,
      })
      .then((response) => {
        const body = response.body;
        expect(body).toHaveProperty('valid');
        expect(body.valid).toBeFalsy();
        expect(body.invalidatedBy).toBe('logout');
      });
  });

  test('invalid by password change', async () => {
    const userId = '4799cc31-7692-40b3-afff-cc562baf5376';
    const loginId = '1731355542036';
    const iat = Math.floor(Date.now() / 1000);

    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCache = await containerRuntimeClient.container.fetchByLabel(
      'poc-nestjs-name',
      'auth-service-cache',
    );

    await containerRuntimeClient.container.exec(containerCache, [
      'redis-cli',
      'SET',
      [CacheKeyPrefix.AUTH_PASSWORD_CHANGE, userId].join(':'),
      JSON.stringify({
        value: {
          changedAt: Date.now(),
          expires: new Date().getTime() + 60000,
        },
      }),
    ]);

    await request(host)
      .post(endpoint)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .send({
        userId,
        loginId,
        iat,
      })
      .then((response) => {
        const body = response.body;
        expect(body).toHaveProperty('valid');
        expect(body.valid).toBeFalsy();
        expect(body.invalidatedBy).toBe('password');
      });
  });

  test('invalid by user status', async () => {
    const userId = '10f88251-d181-4255-92ed-d0d874e3a166';
    const loginId = new Date().getTime().toString();
    const iat = Math.floor(Date.now() / 1000);

    await request(host)
      .post(endpoint)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .send({
        userId,
        loginId,
        iat,
        verify: ['isActive'],
      })
      .then((response) => {
        const body = response.body;
        expect(body).toHaveProperty('valid');
        expect(body.valid).toBeFalsy();
        expect(body.invalidatedBy).toBe('user-status');
      });
  });
});
