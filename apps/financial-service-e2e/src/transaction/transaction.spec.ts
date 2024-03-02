import request from 'supertest';
import jsonwebtoken from 'jsonwebtoken';
import { getContainerRuntimeClient } from 'testcontainers';
import { UserPayload } from '@shared/authentication/payloads/user.payload';
import { CacheKeyPrefix } from '@shared/cache/enums/cache-key-prefix.enum';

describe('POST /transaction', () => {
  let host: string;
  const endpoint = '/transaction';
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
        .post(endpoint)
        .send({
          accountId: 42,
          type: 'debit',
          amount: 200,
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('request with expired token', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: '10f88251-d181-4255-92ed-d0d874e3a166',
          loginId: new Date().getTime().toString(),
          iat: now - 120,
          exp: now - 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      await request(host)
        .post(endpoint)
        .send({
          accountId: 42,
          type: 'debit',
          amount: 200,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('request with expire token set with higher value than server max age', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: '10f88251-d181-4255-92ed-d0d874e3a166',
          loginId: new Date().getTime().toString(),
          iat: now - 3660, // 1h and 1m before now
          exp: now,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      await request(host)
        .post(endpoint)
        .send({
          accountId: 42,
          type: 'debit',
          amount: 200,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  describe('account ownership and existence', () => {
    test('user does not have access rights to the account', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign(
        {
          userId: '10f88251-d181-4255-92ed-d0d874e3a166',
          loginId: new Date().getTime().toString(),
          iat: now,
          exp: now + 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      await request(host)
        .post(endpoint)
        .send({
          accountId: 42,
          pairAccountId: 43,
          type: 'debit',
          amount: 200,
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
          iat: now,
          exp: now + 60,
        } as UserPayload,
        JWT_SECRET_KEY,
      );

      await request(host)
        .post(endpoint)
        .send({
          accountId: 42,
          pairAccountId: 43,
          type: 'debit',
          amount: 200,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe('transaction creation', () => {
    describe('debit', () => {
      test('create transaction and clear cache', async () => {
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

        await Promise.all([
          // defines a cached value to main account
          containerRuntimeClient.container.exec(containerCache, [
            'redis-cli',
            'SET',
            `${CacheKeyPrefix.FINANCIAL_BALANCE}:3`,
            JSON.stringify(cacheValue),
          ]),
          // defines a cached value to pair account
          containerRuntimeClient.container.exec(containerCache, [
            'redis-cli',
            'SET',
            `${CacheKeyPrefix.FINANCIAL_BALANCE}:4`,
            JSON.stringify(cacheValue),
          ]),
        ]);

        // account 3 access token
        const now = Math.floor(Date.now() / 1000);
        const accessToken = jsonwebtoken.sign(
          {
            userId: 'bc760244-ca8a-42b1-9cf6-70ceedc2e3d1',
            loginId: new Date().getTime().toString(),
            iat: now,
            exp: now + 60,
          } as UserPayload,
          JWT_SECRET_KEY,
        );

        // account 4 access token
        const accessTokenPair = jsonwebtoken.sign(
          {
            userId: 'bc760244-ca8a-42b1-9cf6-70ceedc2e221',
            loginId: new Date().getTime().toString(),
            iat: now,
            exp: now + 60,
          } as UserPayload,
          JWT_SECRET_KEY,
        );

        // request with a random balance to guarantee that is retrieved from cache and not from database
        await request(host)
          .get('/balance')
          .query({
            accountId: 3,
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

        // request with a random balance to guarantee that is retrieved from cache and not from database
        await request(host)
          .get('/balance')
          .query({
            accountId: 4,
          })
          .set('Authorization', `Bearer ${accessTokenPair}`)
          .set('X-Api-Version', '1')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            const body = response.body;
            expect(body.balance).toBe(randomBalance);
            expect(body.cached).toBeTruthy();
          });

        // make a transaction request
        await request(host)
          .post(endpoint)
          .send({
            accountId: 3,
            pairAccountId: 4,
            type: 'debit',
            amount: 25,
          })
          .set('Authorization', `Bearer ${accessToken}`)
          .set('X-Api-Version', '1')
          .expect('Content-Type', /json/)
          .expect(201)
          .then((response) => {
            const body = response.body;
            expect(body).toHaveProperty('fromTransactionId');
            expect(body).toHaveProperty('toTransactionId');
          });

        // get the new balance from database (without cache)
        await request(host)
          .get('/balance')
          .query({
            accountId: 3,
          })
          .set('Authorization', `Bearer ${accessToken}`)
          .set('X-Api-Version', '1')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            const body = response.body;
            expect(body.balance).toBe(875);
            expect(body.cached).toBeFalsy();
          });

        // get the new balance from database (without cache)
        await request(host)
          .get('/balance')
          .query({
            accountId: 4,
          })
          .set('Authorization', `Bearer ${accessTokenPair}`)
          .set('X-Api-Version', '1')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            const body = response.body;
            expect(body.balance).toBe(825);
            expect(body.cached).toBeFalsy();
          });
      });
    });
  });
});
