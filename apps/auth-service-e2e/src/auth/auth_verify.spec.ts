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
      `auth:logout:${userId}:${loginId}`,
      '{}',
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
      `auth:password:${userId}`,
      `{"changedAt": ${Date.now()}}`,
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
});
