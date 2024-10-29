import request from 'supertest';
import { getContainerRuntimeClient } from 'testcontainers';
import jsonwebtoken from 'jsonwebtoken';
import {
  AuthErrorNames,
  AuthRoleEnum,
  UserPayload,
} from '@shared/authentication/graphql';

describe('User Resolver', () => {
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c36875f") {
              name
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result.data.user).toBeNull();
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c36875f") {
              name
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result.data.user).toBeNull();
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c36875f") {
              name
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result.data.user).toBeNull();
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c36875f") {
              name
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.user.name');
      expect(Object.keys(result.data.user).length).toBe(1);
      expect(result.data.user.name).toBe('Shimi');
    });

    test('exists (nested query)(addresses)', async () => {
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c36875f") {
              name
              addresses {
                type
                postalcode
              }
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.user.name');
      expect(result).toHaveProperty('data.user.addresses');
      expect(result.data.user.addresses.length).toBe(2);

      expect(result.data.user.addresses).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'MAIN',
            postalcode: '12345678',
          }),
        ]),
      );

      expect(result.data.user.addresses).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'LEGAL',
            postalcode: '23456789',
          }),
        ]),
      );
    });

    test('exists (nested query)(phones)', async () => {
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c36875f") {
              name
              phones {
                type
                number
              }
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.user.name');
      expect(result).toHaveProperty('data.user.phones');
      expect(result.data.user.phones.length).toBe(2);

      expect(result.data.user.phones).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'MAIN',
            number: 998765432,
          }),
        ]),
      );

      expect(result.data.user.phones).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'HOME',
            number: 912345678,
          }),
        ]),
      );
    });

    test('exists (nested query)(legalDocs)', async () => {
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c36875f") {
              name
              legalDocs {
                type
                identifier
              }
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.user.name');
      expect(result).toHaveProperty('data.user.legalDocs');
      expect(result.data.user.legalDocs.length).toBe(2);

      expect(result.data.user.legalDocs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'BRA_RG',
            identifier: 'MG42',
          }),
        ]),
      );

      expect(result.data.user.legalDocs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'BRA_CNH',
            identifier: '123456',
          }),
        ]),
      );
    });

    test('exists (nested query)(socialMedias)', async () => {
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c36875f") {
              name
              socialMedias {
                type
                identifier
              }
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.user.name');
      expect(result).toHaveProperty('data.user.socialMedias');
      expect(result.data.user.socialMedias.length).toBe(2);

      expect(result.data.user.socialMedias).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'INSTAGRAM',
            identifier: '@shimi_insta',
          }),
        ]),
      );

      expect(result.data.user.socialMedias).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'FACEBOOK',
            identifier: '@shimi_fb',
          }),
        ]),
      );
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c368758") {
              name
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result.data.user).toBeNull();
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c36875f") {
              name
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.user.name');
      expect(Object.keys(result.data.user).length).toBe(1);
      expect(result.data.user.name).toBe('Shimi');
    });

    test('exists (nested query)(addresses)', async () => {
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c36875f") {
              name
              addresses {
                type
                postalcode
              }
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.user.name');
      expect(result).toHaveProperty('data.user.addresses');
      expect(result.data.user.addresses.length).toBe(2);

      expect(result.data.user.addresses).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'MAIN',
            postalcode: '12345678',
          }),
        ]),
      );

      expect(result.data.user.addresses).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'LEGAL',
            postalcode: '23456789',
          }),
        ]),
      );
    });

    test('exists (nested query)(phones)', async () => {
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c36875f") {
              name
              phones {
                type
                number
              }
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.user.name');
      expect(result).toHaveProperty('data.user.phones');
      expect(result.data.user.phones.length).toBe(2);

      expect(result.data.user.phones).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'MAIN',
            number: 998765432,
          }),
        ]),
      );

      expect(result.data.user.phones).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'HOME',
            number: 912345678,
          }),
        ]),
      );
    });

    test('exists (nested query)(legalDocs)', async () => {
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c36875f") {
              name
              legalDocs {
                type
                identifier
              }
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.user.name');
      expect(result).toHaveProperty('data.user.legalDocs');
      expect(result.data.user.legalDocs.length).toBe(2);

      expect(result.data.user.legalDocs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'BRA_RG',
            identifier: 'MG42',
          }),
        ]),
      );

      expect(result.data.user.legalDocs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'BRA_CNH',
            identifier: '123456',
          }),
        ]),
      );
    });

    test('exists (nested query)(socialMedias)', async () => {
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c36875f") {
              name
              socialMedias {
                type
                identifier
              }
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.user.name');
      expect(result).toHaveProperty('data.user.socialMedias');
      expect(result.data.user.socialMedias.length).toBe(2);

      expect(result.data.user.socialMedias).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'INSTAGRAM',
            identifier: '@shimi_insta',
          }),
        ]),
      );

      expect(result.data.user.socialMedias).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'FACEBOOK',
            identifier: '@shimi_fb',
          }),
        ]),
      );
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
            user (userId: "b5667f41-ffae-43a0-a363-a6a12c36875f") {
              name
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.user.name');
      expect(Object.keys(result.data.user).length).toBe(1);
      expect(result.data.user.name).toBe('Shimi');
    });
  });
});
