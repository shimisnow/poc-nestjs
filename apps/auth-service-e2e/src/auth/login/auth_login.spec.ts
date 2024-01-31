import request from 'supertest';
import jsonwebtoken from 'jsonwebtoken';

import { GenericContainer, Network, StartedNetwork, StartedTestContainer, Wait } from 'testcontainers';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

describe('POST /auth/login', () => {
  let dockerNetwork: StartedNetwork;
  let containerDatabase: StartedPostgreSqlContainer;
  let containerCode: StartedTestContainer;
  let AUTH_SERVICE_TEST_PORT: number;

  let host: string;
  const endpoint = '/auth/login';
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

  beforeAll(async () => {
    dockerNetwork = await new Network().start();

    containerDatabase = await new PostgreSqlContainer('postgres:15.2')
      .withNetwork(dockerNetwork)
      .withNetworkAliases('database-authentication')
      .withDatabase(process.env.DATABASE_AUTH_DBNAME)
      .withUsername(process.env.DATABASE_AUTH_USERNAME)
      .withPassword(process.env.DATABASE_AUTH_PASSWORD)
      .withCopyDirectoriesToContainer([{
        source: './deployment/database/authentication',
        target: '/docker-entrypoint-initdb.d',
      }])
      .withWaitStrategy(Wait.forLogMessage('PostgreSQL init process complete; ready for start up.'))
      .start();

    const buildContainerCode = await GenericContainer
      .fromDockerfile('./')
      .build('poc-nestjs-node', { deleteOnExit: false });

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

  describe('API call WITHOUT errors', () => {
    test('User does not exists', async () => {
      await request(host)
        .post(endpoint)
        .send({
          username: 'thomas',
          password: 'test@1234',
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('User exists but it is inactive', async () => {
      await request(host)
        .post(endpoint)
        .send({
          username: 'ericka',
          password: 'test@1234',
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('User is active (wrong password)', async () => {
      await request(host)
        .post(endpoint)
        .send({
          username: 'anderson',
          password: 'password',
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('User is active (correct password)', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'anderson',
          password: 'test@1234',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body;

      expect(body).toHaveProperty('accessToken');
      // throws "JsonWebTokenError: invalid signature" if token is invalid
      jsonwebtoken.verify(body.accessToken, JWT_SECRET_KEY);
    });
  });

  describe('API call WITH errors', () => {
    test('BadRequestResponse: property should not exist', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          name: 'user',
        })
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
});
