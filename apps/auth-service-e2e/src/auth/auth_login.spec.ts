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
    test('User does not exists', async () => {
      await request(host)
        .post(endpoint)
        .send({
          username: 'thomas',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then((response) => {
          const body = response.body;
          expect(body.data.name).toBe(AuthErrorNames.CREDENTIAL_ERROR);
          expect(body.data.errors).toEqual(
            expect.arrayContaining([AuthErrorMessages.WRONG_USER_PASSWORD]),
          );
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
        .then((response) => {
          const body = response.body;
          expect(body.data.name).toBe(AuthErrorNames.CREDENTIAL_ERROR);
          expect(body.data.errors).toEqual(
            expect.arrayContaining([AuthErrorMessages.WRONG_USER_PASSWORD]),
          );
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
        .then((response) => {
          const body = response.body;
          expect(body.data.name).toBe(AuthErrorNames.CREDENTIAL_ERROR);
          expect(body.data.errors).toEqual(
            expect.arrayContaining([AuthErrorMessages.WRONG_USER_PASSWORD]),
          );
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
        body.message.includes('property name should not exist'),
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
      expect(body.message.length).toBe(3);
      expect(
        body.message.includes('username should not be empty'),
      ).toBeTruthy();
    });

    test('Username error by min length', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'a',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(body.message.length).toBe(1);
      expect(
        body.message.includes(
          'username must be longer than or equal to 2 characters',
        ),
      ).toBeTruthy();
    });

    test('Username error by max length', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'abcdefghijklmnopqrstu',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(body.message.length).toBe(1);
      expect(
        body.message.includes(
          'username must be shorter than or equal to 20 characters',
        ),
      ).toBeTruthy();
    });

    test('Username error by regex fail (not allowed character)', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'teste@teste',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(body.message.length).toBe(1);
      expect(
        body.message.includes(
          'only lowercase letters, digits and one underscore or period allowed',
        ),
      ).toBeTruthy();
    });

    test('Username error by regex fail (using _ and . at the same time)', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'teste.teste_teste',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(body.message.length).toBe(1);
      expect(
        body.message.includes(
          'only lowercase letters, digits and one underscore or period allowed',
        ),
      ).toBeTruthy();
    });
  });

  describe('request without errors', () => {
    test('User is active (user)(with refresh)', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'anderson',
          password: 'test@1234',
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
      expect(accessToken.userId).toBe('4799cc31-7692-40b3-afff-cc562baf5374');
      expect(accessToken).toHaveProperty('loginId');
      expect(accessToken).toHaveProperty('role');
      expect(accessToken.role).toBe('user');

      const refreshToken = jsonwebtoken.verify(
        body.refreshToken,
        JWT_REFRESH_SECRET_KEY,
      ) as JwtPayload;
      expect(refreshToken).toHaveProperty('userId');
      expect(refreshToken.userId).toBe('4799cc31-7692-40b3-afff-cc562baf5374');
      expect(refreshToken).toHaveProperty('loginId');
      expect(refreshToken).toHaveProperty('role');
      expect(refreshToken.role).toBe('user');
    });

    test('User is active (admin)(with refresh)', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'paul',
          password: 'test@1234',
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
      expect(accessToken.userId).toBe('26ea2bb9-d5e3-40ca-b144-a863ffb98fbc');
      expect(accessToken).toHaveProperty('loginId');
      expect(accessToken).toHaveProperty('role');
      expect(accessToken.role).toBe('admin');

      const refreshToken = jsonwebtoken.verify(
        body.refreshToken,
        JWT_REFRESH_SECRET_KEY,
      ) as JwtPayload;
      expect(refreshToken).toHaveProperty('userId');
      expect(refreshToken.userId).toBe('26ea2bb9-d5e3-40ca-b144-a863ffb98fbc');
      expect(refreshToken).toHaveProperty('loginId');
      expect(refreshToken).toHaveProperty('role');
      expect(refreshToken.role).toBe('admin');
    });

    test('User is active (user)(without refresh)', async () => {
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

      const accessToken = jsonwebtoken.verify(
        body.accessToken,
        JWT_SECRET_KEY,
      ) as JwtPayload;
      expect(accessToken).toHaveProperty('userId');
      expect(accessToken.userId).toBe('4799cc31-7692-40b3-afff-cc562baf5374');
      expect(accessToken).toHaveProperty('loginId');
      expect(accessToken).toHaveProperty('role');
      expect(accessToken.role).toBe('user');
    });
  });
});
