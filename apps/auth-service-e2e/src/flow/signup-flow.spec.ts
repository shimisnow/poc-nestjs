import request from 'supertest';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { getContainerRuntimeClient } from 'testcontainers';

describe('login logout process (with refresh)', () => {
  let host: string;
  const endpointSignup = '/auth/signup';
  const endpointLogin = '/auth/login';
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

  test('signup and login', async () => {
    const username = 'sherlock' + Math.floor(Math.random() * 1000);
    const password = 'test@1234';
    let userId = '';

    // signup process

    await request(host)
      .post(endpointSignup)
      .send({
        username,
        password,
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(201)
      .then((response) => {
        const body = response.body;
        expect(body).toHaveProperty('status');
        expect(body.status).toBeTruthy();
        expect(body).toHaveProperty('userId');
        userId = body.userId;
      });

    // login with the newly created user

    const response = await request(host)
      .post(endpointLogin)
      .send({
        username,
        password,
        requestRefreshToken: true,
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200);

    const body = response.body;

    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');

    const accessToken = jsonwebtoken.verify(
      body.accessToken,
      JWT_SECRET_KEY,
    ) as JwtPayload;
    expect(accessToken).toHaveProperty('userId');
    expect(accessToken.userId).toBe(userId);
    expect(accessToken).toHaveProperty('loginId');

    const refreshToken = jsonwebtoken.verify(
      body.refreshToken,
      JWT_REFRESH_SECRET_KEY,
    ) as JwtPayload;
    expect(refreshToken).toHaveProperty('userId');
    expect(refreshToken.userId).toBe(userId);
    expect(refreshToken).toHaveProperty('loginId');

    // signup again with the same username

    await request(host)
      .post(endpointSignup)
      .send({
        username,
        password,
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(409);
  });
});
