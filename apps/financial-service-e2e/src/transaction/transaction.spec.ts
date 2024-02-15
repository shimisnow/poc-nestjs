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
    const containerCode = await containerRuntimeClient.container.fetchByLabel('poc-nestjs-name', 'financial-service-code');
    const containerInfo = await containerCode.inspect();
    const FINANCIAL_SERVICE_TEST_PORT = containerInfo.NetworkSettings.Ports[`${process.env.FINANCIAL_SERVICE_PORT}/tcp`][0].HostPort;
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
      const accessToken = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a166',
        loginId: new Date().getTime().toString(),
        iat: now - 120,
        exp: now - 60,
      } as UserPayload, JWT_SECRET_KEY);

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
      const accessToken = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a166',
        loginId: new Date().getTime().toString(),
        iat: now - 3660, // 1h and 1m before now
        exp: now,
      } as UserPayload, JWT_SECRET_KEY);

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
      const accessToken = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a166',
        loginId: new Date().getTime().toString(),
        iat: now,
        exp: now + 60,
      } as UserPayload, JWT_SECRET_KEY);

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
        .expect(403);
    });

    // there is no way to know if the account does no exists or if the user has no access
    // the error will be the same
    test('account does not exists', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a166',
        loginId: new Date().getTime().toString(),
        iat: now,
        exp: now + 60,
      } as UserPayload, JWT_SECRET_KEY);

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
        const containerCache = await containerRuntimeClient.container.fetchByLabel('poc-nestjs-name', 'financial-service-cache');

        await containerRuntimeClient.container.exec(
          containerCache,
          ['redis-cli', 'SET', `${CacheKeyPrefix.FINANCIAL_BALANCE}:3`, JSON.stringify(cacheValue)]
        );
        
        const now = Math.floor(Date.now() / 1000);
        const accessToken = jsonwebtoken.sign({
          userId: 'bc760244-ca8a-42b1-9cf6-70ceedc2e3d1',
          loginId: new Date().getTime().toString(),
          iat: now,
          exp: now + 60,
        } as UserPayload, JWT_SECRET_KEY);

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
          .then(response => {
            const body = response.body;
            expect(body.balance).toBe(randomBalance);
            expect(body.cached).toBeTruthy();
          });

        // make a transaction request
        await request(host)
          .post(endpoint)
          .send({
            accountId: 3,
            type: 'debit',
            amount: 25,
          })
          .set('Authorization', `Bearer ${accessToken}`)
          .set('X-Api-Version', '1')
          .expect('Content-Type', /json/)
          .expect(201)
          .then(response => {
            const body = response.body;
            expect(body).toHaveProperty('transactionId');
            expect(body.transactionId).toBeGreaterThan(0);
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
          .then(response => {
            const body = response.body;
            expect(body.balance).toBe(175);
            expect(body.cached).toBeFalsy();
          });
      });
    
    });

    describe('credit', () => {
      test('create transaction and clear cache', async () => {
        const randomBalance = Math.floor(Math.random() * 10000);
        const cacheValue = {
          balance: randomBalance,
          updatedAt: new Date(),
        };

        const containerRuntimeClient = await getContainerRuntimeClient();
        const containerCache = await containerRuntimeClient.container.fetchByLabel('poc-nestjs-name', 'financial-service-cache');

        await containerRuntimeClient.container.exec(
          containerCache,
          ['redis-cli', 'SET', `${CacheKeyPrefix.FINANCIAL_BALANCE}:5`, JSON.stringify(cacheValue)]
        );
        
        const now = Math.floor(Date.now() / 1000);
        const accessToken = jsonwebtoken.sign({
          userId: '3132a64a-de8b-49cc-b49f-b445ee984415',
          loginId: new Date().getTime().toString(),
          iat: now,
          exp: now + 60,
        } as UserPayload, JWT_SECRET_KEY);

        // request with a random balance to guarantee that is retrieved from cache and not from database
        await request(host)
          .get('/balance')
          .query({
            accountId: 5,
          })
          .set('Authorization', `Bearer ${accessToken}`)
          .set('X-Api-Version', '1')
          .expect('Content-Type', /json/)
          .expect(200)
          .then(response => {
            const body = response.body;
            expect(body.balance).toBe(randomBalance);
            expect(body.cached).toBeTruthy();
          });

        // make a transaction request
        await request(host)
          .post(endpoint)
          .send({
            accountId: 5,
            type: 'credit',
            amount: 49,
          })
          .set('Authorization', `Bearer ${accessToken}`)
          .set('X-Api-Version', '1')
          .expect('Content-Type', /json/)
          .expect(201)
          .then(response => {
            const body = response.body;
            expect(body).toHaveProperty('transactionId');
            expect(body.transactionId).toBeGreaterThan(0);
          });

        // get the new balance from database (without cache)
        await request(host)
          .get('/balance')
          .query({
            accountId: 5,
          })
          .set('Authorization', `Bearer ${accessToken}`)
          .set('X-Api-Version', '1')
          .expect('Content-Type', /json/)
          .expect(200)
          .then(response => {
            const body = response.body;
            expect(body.balance).toBe(1050);
            expect(body.cached).toBeFalsy();
          });
      });
    });
  });
});
