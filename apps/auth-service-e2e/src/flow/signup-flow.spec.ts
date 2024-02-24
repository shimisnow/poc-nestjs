import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { getContainerRuntimeClient } from 'testcontainers';
import { AuthErrorNames } from '@shared/authentication/enums/auth-error-names.enum';
import { AuthErrorMessages } from '@shared/authentication/enums/auth-error-messages.enum';

describe('login logout process (with refresh)', () => {
  let host: string;
  const endpointAvailable = '/auth/username/available';
  const endpointSignup = '/auth/signup';
  const endpointLogin = '/auth/login';
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
  const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCode = await containerRuntimeClient.container.fetchByLabel('poc-nestjs-name', 'auth-service-code');
    const containerInfo = await containerCode.inspect();
    const AUTH_SERVICE_TEST_PORT = containerInfo.NetworkSettings.Ports[`${process.env.AUTH_SERVICE_PORT}/tcp`][0].HostPort;
    host = `http://localhost:${AUTH_SERVICE_TEST_PORT}`;
  });

  test('username available signup and login', async () => {
    const userId = uuidv4();
    const username = 'sherlock-' + Math.floor(Math.random() * 1000);
    const password = 'test@1234';

    // verify if the username is available

    await request(host)
      .get(endpointAvailable)
      .query({
        username,
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body).toHaveProperty('available');
        expect(body.available).toBeTruthy();
      });

    // signup process

    await request(host)
      .post(endpointSignup)
      .send({
        userId,
        username,
        password,
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(201)
      .then(response => {
        const body = response.body;
        expect(body).toHaveProperty('status');
        expect(body.status).toBeTruthy();
      });

    // vefify if the username is available

    await request(host)
      .get(endpointAvailable)
      .query({
        username,
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body).toHaveProperty('available');
        expect(body.available).toBeFalsy();
      });

    // login with the newly created user
      
    const response = await request(host)
      .post(endpointLogin)
      .send({
        username,
        password,
        requestAccessToken: true,
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200);

    const body = response.body;

    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');

    const accessToken = jsonwebtoken.verify(body.accessToken, JWT_SECRET_KEY) as JwtPayload;
    expect(accessToken).toHaveProperty('userId');
    expect(accessToken.userId).toBe(userId);
    expect(accessToken).toHaveProperty('loginId');

    const refreshToken = jsonwebtoken.verify(body.refreshToken, JWT_REFRESH_SECRET_KEY) as JwtPayload;
    expect(refreshToken).toHaveProperty('userId');
    expect(refreshToken.userId).toBe(userId);
    expect(refreshToken).toHaveProperty('loginId');

    // signup again with the same username

    await request(host)
      .post(endpointSignup)
      .send({
        userId,
        username,
        password,
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(409);
  });

});
