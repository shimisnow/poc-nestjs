import request from 'supertest';
import jsonwebtoken from 'jsonwebtoken';

import { GenericContainer, Network, StartedNetwork, StartedTestContainer, Wait } from 'testcontainers';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';

describe('GET /balance', () => {
  const DOCKER_IMAGE_BUILD_NAME = 'poc-nestjs-node';
  const DOCKER_POSTGRES_TAG = 'postgres:15.2';
  const DOCKER_REDIS_TAG = 'redis:7.2.1';

  let dockerNetwork: StartedNetwork;
  let containerDatabase: StartedPostgreSqlContainer;
  let containerCache: StartedRedisContainer;
  let containerCode: StartedTestContainer;
  let FINANCIAL_SERVICE_TEST_PORT: number;

  let host: string;
  const endpoint = '/balance';
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

  beforeAll(async () => {
    dockerNetwork = await new Network().start();

    /***** DATABASE *****/

    containerDatabase = await new PostgreSqlContainer(DOCKER_POSTGRES_TAG)
      .withNetwork(dockerNetwork)
      .withNetworkAliases('database-financial')
      .withDatabase(process.env.DATABASE_FINANCIAL_DBNAME)
      .withUsername(process.env.DATABASE_FINANCIAL_USERNAME)
      .withPassword(process.env.DATABASE_FINANCIAL_PASSWORD)
      // copy SQL files to populate the database
      .withCopyDirectoriesToContainer([{
        source: './deployment/database/financial',
        target: '/docker-entrypoint-initdb.d',
      }])
      .withWaitStrategy(Wait.forLogMessage('PostgreSQL init process complete; ready for start up.'))
      .start();

    /***** CACHE *****/

    containerCache = await new RedisContainer(DOCKER_REDIS_TAG)
      .withNetwork(dockerNetwork)
      .withNetworkAliases('redis')
      .withExposedPorts(parseInt(process.env.REDIS_PORT))
      .start();

    /***** NODE (CODE) *****/

    const buildContainerCode = await GenericContainer
      .fromDockerfile('./')
      .build(DOCKER_IMAGE_BUILD_NAME, { deleteOnExit: false });

    containerCode = await buildContainerCode
      .withNetwork(dockerNetwork)
      .withNetworkAliases('financial-service')
      .withExposedPorts(parseInt(process.env.FINANCIAL_SERVICE_PORT))
      .withCopyFilesToContainer([{
        source: './dist/apps/financial-service/main.js',
        target: '/home/node/app/main.js'
      }])
      .withCommand(['node', 'main.js'])
      .withEnvironment({
        DATABASE_FINANCIAL_HOST: 'database-financial',
        DATABASE_FINANCIAL_PORT:  '5432',
        DATABASE_FINANCIAL_USERNAME: process.env.DATABASE_FINANCIAL_USERNAME,
        DATABASE_FINANCIAL_PASSWORD: process.env.DATABASE_FINANCIAL_PASSWORD,
        DATABASE_FINANCIAL_DBNAME: process.env.DATABASE_FINANCIAL_DBNAME,
        REDIS_HOST: 'redis',
        REDIS_PORT: process.env.REDIS_PORT,
        JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
        JWT_MAX_AGE: process.env.JWT_MAX_AGE,
        FINANCIAL_SERVICE_PORT: process.env.FINANCIAL_SERVICE_PORT,
      })
      .start();

    /***** SETUP *****/

    FINANCIAL_SERVICE_TEST_PORT = containerCode.getMappedPort(parseInt(process.env.FINANCIAL_SERVICE_PORT));
    host = `http://localhost:${FINANCIAL_SERVICE_TEST_PORT}`;

  // it needs a high timeout to enable the containers creation
  }, (10 * 60000));

  afterAll(async () => {
    containerDatabase.stop();
    containerCache.stop();
    containerCode.stop();
  });

  describe('unauthorized jwt access to endpoint', () => {
    test('request without token', async () => {
      await request(host)
        .get(endpoint)
        .query({
          accountId: 42,
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('request with expired token', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a166',
        iat: now - 120,
        exp: now - 60,
      }, JWT_SECRET_KEY);

      await request(host)
        .get(endpoint)
        .query({
          accountId: 1,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('request with expire token set with higher value than server max age', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a166',
        iat: now - 3660, // 1h and 1m before now
        exp: now,
      }, JWT_SECRET_KEY);

      await request(host)
        .get(endpoint)
        .query({
          accountId: 1,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  describe('account ownership and existence', () => {
    test('user does not have access rights to the account', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a166',
        iat: now,
        exp: now + 60,
      }, JWT_SECRET_KEY);

      await request(host)
        .get(endpoint)
        .query({
          accountId: 2,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });

    // there is no way to know if the account does no exists or if the user has no access
    // the error will be the same
    test('account does not exists', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a166',
        iat: now,
        exp: now + 60,
      }, JWT_SECRET_KEY);

      await request(host)
        .get(endpoint)
        .query({
          accountId: 42,
        })
        .set('Authorization', `Bearer ${accessToken}`)
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
      
      await containerCache.exec(
        `redis-cli SET balance-acc-2 ${JSON.stringify(cacheValue)}`
      );

      const now = Math.floor(Date.now() / 1000);
      const accessToken = jsonwebtoken.sign({
        userId: '6d162827-98a1-4d20-8aa0-0a9c3e8fc76f',
        iat: now,
        exp: now + 60,
      }, JWT_SECRET_KEY);

      // request with a random balance to guarantee that is retrieved from cache and not from database
      await request(host)
        .get(endpoint)
        .query({
          accountId: 2,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          const body = response.body;
          expect(body.balance).toBe(randomBalance);
          expect(body.cached).toBeTruthy();
        });
    });

    test('get balance from database (no cache)', async () => {});
  });
});