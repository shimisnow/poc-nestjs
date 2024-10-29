import request from 'supertest';
import { getContainerRuntimeClient } from 'testcontainers';
import jsonwebtoken from 'jsonwebtoken';
import {
  AuthErrorNames,
  AuthRoleEnum,
  UserPayload,
} from '@shared/authentication/graphql';

describe('Legal Doc Resolver', () => {
  let host: string;
  const endpoint = '/api';
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCode = await containerRuntimeClient.container.fetchByLabel(
      'poc-nestjs-name',
      'user-service-code',
    );
    const containerInfo = await containerCode.inspect();
    const USER_SERVICE_TEST_PORT =
      containerInfo.NetworkSettings.Ports[
        `${process.env.USER_SERVICE_PORT}/tcp`
      ][0].HostPort;
    host = `http://localhost:${USER_SERVICE_TEST_PORT}`;
  });

  describe('authentication', () => {
    test('request without token', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          query: `{
            legaldocs (legalDocId: 1) {
              identifier
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result.data.legaldocs).toBeNull();
      expect(result).toHaveProperty('errors');

      const error = result.errors[0];

      expect(error.extensions.statusCode).toBe(401);
      expect(error.extensions.data.name).toBe(AuthErrorNames.JWT_EMPTY_ERROR);
    });

    test('request with expired token', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: 'b5667f41-ffae-43a0-a363-a6a12c36875f',
          loginId: new Date().getTime().toString(),
          role: AuthRoleEnum.USER,
          iat: now - 120,
          exp: now - 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      const response = await request(host)
        .post(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `{
            legaldocs (legalDocId: 1) {
              identifier
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result.data.legaldocs).toBeNull();
      expect(result).toHaveProperty('errors');

      const error = result.errors[0];

      expect(error.extensions.statusCode).toBe(401);
      expect(error.extensions.data.name).toBe(AuthErrorNames.JWT_EXPIRED_ERROR);
      expect(error.extensions.data).toHaveProperty('expiredAt');
      expect(error.extensions.data.errors).toEqual(
        expect.arrayContaining(['jwt expired']),
      );
    });

    test('request with expire token set with higher value than server max age', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: 'b5667f41-ffae-43a0-a363-a6a12c36875f',
          loginId: new Date().getTime().toString(),
          role: AuthRoleEnum.USER,
          iat: now - 4000,
          exp: now + 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      const response = await request(host)
        .post(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `{
            legaldocs (legalDocId: 1) {
              identifier
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result.data.legaldocs).toBeNull();
      expect(result).toHaveProperty('errors');

      const error = result.errors[0];

      expect(error.extensions.statusCode).toBe(401);
      expect(error.extensions.data.name).toBe(AuthErrorNames.JWT_EXPIRED_ERROR);
      expect(error.extensions.data).toHaveProperty('expiredAt');
      expect(error.extensions.data.errors).toEqual(
        expect.arrayContaining(['maxAge exceeded']),
      );
    });
  });

  describe('data request (role: user)', () => {
    test('exists', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: 'b5667f41-ffae-43a0-a363-a6a12c36875f',
          loginId: new Date().getTime().toString(),
          role: AuthRoleEnum.USER,
          iat: now,
          exp: now + 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      const response = await request(host)
        .post(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `{
            legaldocs (legalDocId: 1) {
              identifier
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.legaldocs.identifier');
      expect(Object.keys(result.data.legaldocs).length).toBe(1);
      expect(result.data.legaldocs.identifier).toBe('MG42');
    });

    test('exists (nested query)', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: 'b5667f41-ffae-43a0-a363-a6a12c36875f',
          loginId: new Date().getTime().toString(),
          role: AuthRoleEnum.USER,
          iat: now,
          exp: now + 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      const response = await request(host)
        .post(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `{
            legaldocs (legalDocId: 1) {
              identifier
              user {
                name
              }
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.legaldocs.identifier');
      expect(result).toHaveProperty('data.legaldocs.user');
      expect(result).toHaveProperty('data.legaldocs.user.name');
      expect(result.data.legaldocs.identifier).toBe('MG42');
      expect(result.data.legaldocs.user.name).toBe('Shimi');
    });

    test('user is not the owner', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: 'b5667f41-ffae-43a0-a363-a6a12c36875f',
          loginId: new Date().getTime().toString(),
          role: AuthRoleEnum.USER,
          iat: now,
          exp: now + 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      const response = await request(host)
        .post(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `{
            legaldocs (legalDocId: 42) {
              identifier
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result.data.legaldocs).toBeNull();
    });
  });

  describe('data request (role: admin)', () => {
    test('exists', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: '9208de38-c2c7-43b6-b293-5d99b1068218',
          loginId: new Date().getTime().toString(),
          role: AuthRoleEnum.ADMIN,
          iat: now,
          exp: now + 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      const response = await request(host)
        .post(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `{
            legaldocs (legalDocId: 1) {
              identifier
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.legaldocs.identifier');
      expect(Object.keys(result.data.legaldocs).length).toBe(1);
      expect(result.data.legaldocs.identifier).toBe('MG42');
    });

    test('exists (nested query)', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: '9208de38-c2c7-43b6-b293-5d99b1068218',
          loginId: new Date().getTime().toString(),
          role: AuthRoleEnum.ADMIN,
          iat: now,
          exp: now + 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      const response = await request(host)
        .post(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `{
            legaldocs (legalDocId: 1) {
              identifier
              user {
                name
              }
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.legaldocs.identifier');
      expect(result).toHaveProperty('data.legaldocs.user');
      expect(result).toHaveProperty('data.legaldocs.user.name');
      expect(result.data.legaldocs.identifier).toBe('MG42');
      expect(result.data.legaldocs.user.name).toBe('Shimi');
    });

    test('user is not the owner', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: '9208de38-c2c7-43b6-b293-5d99b1068218',
          loginId: new Date().getTime().toString(),
          role: AuthRoleEnum.ADMIN,
          iat: now,
          exp: now + 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      const response = await request(host)
        .post(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `{
            legaldocs (legalDocId: 3) {
              identifier
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.legaldocs.identifier');
      expect(Object.keys(result.data.legaldocs).length).toBe(1);
      expect(result.data.legaldocs.identifier).toBe('565141234');
    });
  });
});
