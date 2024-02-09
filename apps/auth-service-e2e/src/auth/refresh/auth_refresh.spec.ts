import request from 'supertest';
import jsonwebtoken from 'jsonwebtoken';

import { GenericContainer, Network, StartedNetwork, StartedTestContainer, Wait } from 'testcontainers';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

describe('POST /auth/refresh', () => {
  const DOCKER_IMAGE_BUILD_NAME = 'poc-nestjs-node';
  const DOCKER_POSTGRES_TAG = 'postgres:16.1';

  let dockerNetwork: StartedNetwork;
  let containerDatabase: StartedPostgreSqlContainer;
  let containerCode: StartedTestContainer;
  let AUTH_SERVICE_TEST_PORT: number;

  let host: string;
  const endpoint = '/auth/refresh';
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
  const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

  beforeAll(async () => {
    dockerNetwork = await new Network().start();

    containerDatabase = await new PostgreSqlContainer(DOCKER_POSTGRES_TAG)
      .withNetwork(dockerNetwork)
      .withNetworkAliases('database-authentication')
      .withDatabase(process.env.DATABASE_AUTH_DBNAME)
      .withUsername(process.env.DATABASE_AUTH_USERNAME)
      .withPassword(process.env.DATABASE_AUTH_PASSWORD)
      // copy SQL files to populate the database
      .withCopyDirectoriesToContainer([{
        source: './deployment/database/authentication',
        target: '/docker-entrypoint-initdb.d',
      }])
      .withWaitStrategy(Wait.forLogMessage('PostgreSQL init process complete; ready for start up.'))
      .start();

    const buildContainerCode = await GenericContainer
      .fromDockerfile('./')
      .build(DOCKER_IMAGE_BUILD_NAME, { deleteOnExit: false });

    containerCode = await buildContainerCode
      .withNetwork(dockerNetwork)
      .withNetworkAliases('auth-service')
      .withExposedPorts(parseInt(process.env.AUTH_SERVICE_PORT))
      .withCopyFilesToContainer([{
        source: './dist/apps/auth-service/main.js',
        target: '/home/node/app/main.js'
      }])
      .withCommand(['node', 'main.js'])
      .withEnvironment({
        DATABASE_AUTH_HOST: 'database-authentication',
        DATABASE_AUTH_PORT:  '5432',
        DATABASE_AUTH_USERNAME: process.env.DATABASE_AUTH_USERNAME,
        DATABASE_AUTH_PASSWORD: process.env.DATABASE_AUTH_PASSWORD,
        DATABASE_AUTH_DBNAME: process.env.DATABASE_AUTH_DBNAME,
        JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
        JWT_REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY,
        JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
        JWT_REFRESH_MAX_AGE: process.env.JWT_REFRESH_MAX_AGE,
        AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT,
      })
      .start();

    AUTH_SERVICE_TEST_PORT = containerCode.getMappedPort(parseInt(process.env.AUTH_SERVICE_PORT));
    host = `http://localhost:${AUTH_SERVICE_TEST_PORT}`;
  
  // it needs a high timeout to enable the containers creation
  }, (10 * 60000));

  afterAll(async () => {
    containerDatabase.stop();
    containerCode.stop();
  });

  describe('authentication errors', () => {
    test('User does not exists', async () => {
      const now = Math.floor(Date.now() / 1000);
      const refreshToken = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a177',
        iat: now,
        exp: now + 60,
      }, JWT_REFRESH_SECRET_KEY);

      await request(host)
        .get(endpoint)
        .set('Authorization', `Bearer ${refreshToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then(response => {
          const body = response.body;
          expect(body.data.name).toBe('UserPasswordError');
          expect(body.data.errors).toEqual(expect.arrayContaining(['user is inactive or does not exists']));
        });
    });

    test('User exists but it is inactive', async () => {
      const now = Math.floor(Date.now() / 1000);
      const refreshToken = jsonwebtoken.sign({
        userId: '10f88251-d181-4255-92ed-d0d874e3a166',
        iat: now,
        exp: now + 60,
      }, JWT_REFRESH_SECRET_KEY);
      
      await request(host)
        .get(endpoint)
        .set('Authorization', `Bearer ${refreshToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then(response => {
          const body = response.body;
          expect(body.data.name).toBe('UserPasswordError');
          expect(body.data.errors).toEqual(expect.arrayContaining(['user is inactive or does not exists']));
        });
    });
  });

  describe('request without errors', () => {
    test('User is active (correct password)', async () => {
      const now = Math.floor(Date.now() / 1000);
      const refreshToken = jsonwebtoken.sign({
        userId: '4799cc31-7692-40b3-afff-cc562baf5374',
        iat: now,
        exp: now + 60,
      }, JWT_REFRESH_SECRET_KEY);

      const response = await request(host)
        .get(endpoint)
        .set('Authorization', `Bearer ${refreshToken}`)
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body;

      expect(body).toHaveProperty('accessToken');
      // throws "JsonWebTokenError: invalid signature" if token is invalid
      jsonwebtoken.verify(body.accessToken, JWT_SECRET_KEY);
    });
  });
});
