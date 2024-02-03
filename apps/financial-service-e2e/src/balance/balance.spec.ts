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
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
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

  describe('unauthorized access to endpoint', () => {
    test('request without token', async () => {
      await request(host)
        .get(endpoint)
        .query({
          accountId: 42,
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('request without token', async () => {});
  });

  describe('account ownership and existence', () => {
    test('user does not have access rights to the account', async () => {
      const accessToken = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a166',
        iat: new Date().getTime(),
        exp: new Date().getTime() + 60000,
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

    // there is no way to know if the account does no exists or if the user has no access
    // the error will be the same
    test('account does not exists', async () => {
      const accessToken = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a789',
        iat: new Date().getTime(),
        exp: new Date().getTime() + 60000,
      }, JWT_SECRET_KEY);

      await request(host)
        .get(endpoint)
        .query({
          accountId: 1,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  /* describe('balance retrieval', () => {
    test('get balance from cache', async () => {});

    test('get balance from database (no cache)', async () => {});
  }); */
});