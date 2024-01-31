import request from 'supertest';

import { GenericContainer, Network, StartedNetwork, StartedTestContainer, Wait } from 'testcontainers';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

describe('GET /auth/signup', () => {
  const DOCKER_IMAGE_BUILD_NAME = 'poc-nestjs-node';
  const DOCKER_POSTGRES_TAG = 'postgres:15.2';

  let dockerNetwork: StartedNetwork;
  let containerDatabase: StartedPostgreSqlContainer;
  let containerCode: StartedTestContainer;
  let AUTH_SERVICE_TEST_PORT: number;

  let host: string;
  const endpoint = '/auth/signup';

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

    test('User can be created', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          userId: '036e4197-8af6-40ae-9a03-2e36e55de03a',
          username: 'marta',
          password: 'test@1234',
        })
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body;

      expect(body).toHaveProperty('status');
      expect(body.status).toBeTruthy();
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
        body.message.includes('property name should not exist'),
      ).toBeTruthy();
    });

    test('BadRequestResponse: error validating request input data', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: '',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(
        body.message.includes('username should not be empty'),
      ).toBeTruthy();
    });

    test('ConflictResponse: duplicated user data (username)', async () => {
      await request(host)
        .post(endpoint)
        .send({
          userId: 'be54b604-a660-4933-a43b-f513b8474e3c',
          username: 'anderson',
          password: 'test@1234',
        })
        .expect('Content-Type', /json/)
        .expect(409);
    });

    test('ConflictResponse: duplicated user data (userId)', async () => {
      await request(host)
        .post(endpoint)
        .send({
          userId: '4799cc31-7692-40b3-afff-cc562baf5374',
          username: 'emerson',
          password: 'test@1234',
        })
        .expect('Content-Type', /json/)
        .expect(409);
    });
  });
});
