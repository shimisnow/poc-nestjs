import request from 'supertest';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { getContainerRuntimeClient } from 'testcontainers';
import { AuthErrorNames } from '@shared/authentication/enums/auth-error-names.enum';
import { AuthErrorMessages } from '@shared/authentication/enums/auth-error-messages.enum';

describe('POST /auth/login', () => {
  let host: string;
  const endpoint = '/auth/login';
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
      await request(host)
        .post(endpoint)
        .send({
          username: 'thomas',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        // .expect(401)
        .then(response => {
          console.log(response.body);
          const body = response.body;
          expect(body.data.name).toBe(AuthErrorNames.CREDENTIAL_ERROR);
          expect(body.data.errors).toEqual(expect.arrayContaining([AuthErrorMessages.WRONG_USER_PASSWORD]));
        });
    });

    test('User exists but it is inactive', async () => {
      await request(host)
        .post(endpoint)
        .send({
          username: 'ericka',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then(response => {
          const body = response.body;
          expect(body.data.name).toBe(AuthErrorNames.CREDENTIAL_ERROR);
          expect(body.data.errors).toEqual(expect.arrayContaining([AuthErrorMessages.WRONG_USER_PASSWORD]));
        });
    });

    test('User is active (wrong password)', async () => {
      await request(host)
        .post(endpoint)
        .send({
          username: 'anderson',
          password: 'password',
        })
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

  describe('request with errors', () => {
    test('BadRequestResponse: property should not exist', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          name: 'user',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(
        body.message.includes('property name should not exist')
      ).toBeTruthy();
    });

    test('BadRequestResponse: error validating request input data', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: '',
          password: '',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(body.message.length).toBe(2);
      expect(
        body.message.includes('username should not be empty')
      ).toBeTruthy();
    });
  });

  describe('request without errors', () => {
    test('User is active (correct password)(with refresh)', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'anderson',
          password: 'test@1234',
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
      expect(accessToken.userId).toBe('4799cc31-7692-40b3-afff-cc562baf5374');
      expect(accessToken).toHaveProperty('loginId');

      const refreshToken = jsonwebtoken.verify(body.refreshToken, JWT_REFRESH_SECRET_KEY) as JwtPayload;
      expect(refreshToken).toHaveProperty('userId');
      expect(refreshToken.userId).toBe('4799cc31-7692-40b3-afff-cc562baf5374');
      expect(refreshToken).toHaveProperty('loginId');
    });

    test('User is active (correct password)(without refresh)', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'anderson',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body;

      expect(body).toHaveProperty('accessToken');
      expect(body).not.toHaveProperty('refreshToken');

      const accessToken = jsonwebtoken.verify(body.accessToken, JWT_SECRET_KEY) as JwtPayload;
      expect(accessToken).toHaveProperty('userId');
      expect(accessToken.userId).toBe('4799cc31-7692-40b3-afff-cc562baf5374');
      expect(accessToken).toHaveProperty('loginId');
    });
  });
});
