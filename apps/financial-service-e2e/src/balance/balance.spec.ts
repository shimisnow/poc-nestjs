import request from 'supertest';
import jsonwebtoken from 'jsonwebtoken';
import { getContainerRuntimeClient } from 'testcontainers';
import { UserPayload } from '@shared/authentication/payloads/user.payload';
import { CacheKeyPrefix } from '@shared/cache/enums/cache-key-prefix.enum';

describe('GET /balance', () => {
  let host: string;
  const endpoint = '/balance';
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCode = await containerRuntimeClient.container.fetchByLabel(
      'poc-nestjs-name',
      'financial-service-code',
    );
    const containerInfo = await containerCode.inspect();
    const FINANCIAL_SERVICE_TEST_PORT =
      containerInfo.NetworkSettings.Ports[
        `${process.env.FINANCIAL_SERVICE_PORT}/tcp`
      ][0].HostPort;
    host = `http://localhost:${FINANCIAL_SERVICE_TEST_PORT}`;
  });

  describe('unauthorized jwt access to endpoint', () => {
    test('request without token', async () => {
      await request(host)
        .get(endpoint)
        .query({
          accountId: 42,
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then((response) => {
          const body = response.body;
          expect(body.data.name).toBe('EmptyJsonWebTokenError');
        });
    });

    test('request with expired token', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: '10f88251-d181-4255-92ed-d0d874e3a166',
          loginId: new Date().getTime().toString(),
          role: 'user',
          iat: now - 120,
          exp: now - 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      await request(host)
        .get(endpoint)
        .query({
          accountId: 1,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then((response) => {
          const body = response.body;
          expect(body.data.name).toBe('TokenExpiredError');
          expect(body.data).toHaveProperty('expiredAt');
          expect(body.data.errors).toEqual(
            expect.arrayContaining(['jwt expired']),
          );
        });
    });

    test('request with expire token set with higher value than server max age', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: '10f88251-d181-4255-92ed-d0d874e3a166',
          loginId: new Date().getTime().toString(),
          role: 'user',
          iat: now - 4000,
          exp: now + 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      await request(host)
        .get(endpoint)
        .query({
          accountId: 1,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then((response) => {
          const body = response.body;
          expect(body.data.name).toBe('TokenExpiredError');
          expect(body.data).toHaveProperty('expiredAt');
          expect(body.data.errors).toEqual(
            expect.arrayContaining(['maxAge exceeded']),
          );
        });
    });
  });

  describe('account ownership and existence', () => {
    test('user does not have access rights to the account', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: '10f88251-d181-4255-92ed-d0d874e3a166',
          loginId: new Date().getTime().toString(),
          role: 'user',
          iat: now,
          exp: now + 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      await request(host)
        .get(endpoint)
        .query({
          accountId: 2,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(403);
    });

    // there is no way to know if the account does no exists or if the user has no access
    // the error will be the same
    test('account does not exists', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: '10f88251-d181-4255-92ed-d0d874e3a166',
          loginId: new Date().getTime().toString(),
          role: 'user',
          iat: now,
          exp: now + 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      await request(host)
        .get(endpoint)
        .query({
          accountId: 42,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe('balance retrieval', () => {
    test('get balance from cache', async () => {
      const randomBalance = Math.floor(Math.random() * 10000);
      const cacheValue = {
        balance: randomBalance,
        updatedAt: new Date(),
      };

      const containerRuntimeClient = await getContainerRuntimeClient();
      const containerCache =
        await containerRuntimeClient.container.fetchByLabel(
          'poc-nestjs-name',
          'financial-service-cache',
        );

      await containerRuntimeClient.container.exec(containerCache, [
        'redis-cli',
        'SET',
        [CacheKeyPrefix.FINANCIAL_BALANCE, 2].join(':'),
        JSON.stringify({
          value: cacheValue,
        }),
      ]);

      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: '6d162827-98a1-4d20-8aa0-0a9c3e8fc76f',
          loginId: new Date().getTime().toString(),
          role: 'user',
          iat: now,
          exp: now + 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      // request with a random balance to guarantee
      // that it was retrieved from cache and not from database
      await request(host)
        .get(endpoint)
        .query({
          accountId: 2,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          const body = response.body;
          expect(body.balance).toBe(randomBalance);
          expect(body.cached).toBeTruthy();
        });
    });

    test('get balance from database (no cache)', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: '17e31ebd-7728-4fa1-9942-0971b176f342',
          loginId: new Date().getTime().toString(),
          role: 'user',
          iat: now,
          exp: now + 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      await request(host)
        .get(endpoint)
        .query({
          accountId: 10,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          const body = response.body;
          expect(body.balance).toBe(200);
          expect(body.cached).toBeFalsy();
        });
    });
  });
});
