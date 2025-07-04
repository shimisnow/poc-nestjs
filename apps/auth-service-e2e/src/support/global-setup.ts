/* eslint-disable */
import {
  GenericContainer,
  Network,
  StartedNetwork,
  StartedTestContainer,
  Wait,
} from 'testcontainers';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';

module.exports = async function () {
  const DOCKER_IMAGE_AUTH_SERVICE = 'shimisnow/pocnestjs-auth-service:latest';
  const DOCKER_POSTGRES_TAG = 'postgres:17.0';
  const DOCKER_REDIS_TAG = 'valkey/valkey:8.0.1';

  const dockerNetwork: StartedNetwork = await new Network().start();

  /***** BUILD SERVICE DOCKER IMAGE *****/

  console.log(`Building docker image: ${DOCKER_IMAGE_AUTH_SERVICE}`);

  const authServiceImage = await GenericContainer.fromDockerfile(
    './',
    'apps/auth-service/Dockerfile',
  ).build(DOCKER_IMAGE_AUTH_SERVICE, {
    deleteOnExit: false,
  });

  /***** DEPENDENCIES SETUP *****/

  console.log('Setting up database container');

  const authDatabaseContainerSetup = new PostgreSqlContainer(
    DOCKER_POSTGRES_TAG,
  )
    .withNetwork(dockerNetwork)
    .withNetworkAliases('database-authentication')
    .withDatabase(process.env.DATABASE_AUTH_DBNAME)
    .withUsername(process.env.DATABASE_AUTH_USERNAME)
    .withPassword(process.env.DATABASE_AUTH_PASSWORD)
    // copy SQL files to populate the database
    .withCopyDirectoriesToContainer([
      {
        source: './apps/auth-service-e2e/dependencies/database',
        target: '/docker-entrypoint-initdb.d',
      },
    ])
    .withWaitStrategy(
      Wait.forLogMessage(
        'PostgreSQL init process complete; ready for start up.',
      ),
    );

  console.log('Setting up cache container');

  const cacheContainerSetup = new RedisContainer(DOCKER_REDIS_TAG)
    .withLabels({ 'poc-nestjs-name': 'auth-service-cache' })
    .withNetwork(dockerNetwork)
    .withNetworkAliases('redis')
    .withExposedPorts(parseInt(process.env.REDIS_PORT));

  /***** DEPENDENCIES START *****/

  console.log('Starting database and cache containers');

  const [authDatabaseContainer, cacheContainer] = await Promise.all([
    authDatabaseContainerSetup.start(),
    cacheContainerSetup.start(),
  ]);

  /***** CODE *****/

  console.log('Starting code container');

  const authCodeContainer: StartedTestContainer = await authServiceImage
    .withLabels({ 'poc-nestjs-name': 'auth-service-code' })
    .withNetwork(dockerNetwork)
    .withNetworkAliases('auth-service')
    .withExposedPorts(parseInt(process.env.AUTH_SERVICE_PORT))
    .withEnvironment({
      DATABASE_AUTH_HOST: 'database-authentication',
      DATABASE_AUTH_PORT: '5432',
      DATABASE_AUTH_USERNAME: process.env.DATABASE_AUTH_USERNAME,
      DATABASE_AUTH_PASSWORD: process.env.DATABASE_AUTH_PASSWORD,
      DATABASE_AUTH_DBNAME: process.env.DATABASE_AUTH_DBNAME,
      REDIS_HOST: 'redis',
      REDIS_PORT: process.env.REDIS_PORT,
      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      JWT_REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY,
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
      JWT_REFRESH_EXPIRES_IN_ADMIN: process.env.JWT_REFRESH_EXPIRES_IN_ADMIN,
      JWT_REFRESH_MAX_AGE: process.env.JWT_REFRESH_MAX_AGE,
      AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT,
      AUTH_SERVICE_LOG_DIR: './logs',
    })
    .withWaitStrategy(Wait.forListeningPorts())
    // use this to see container log in realtime
    /* .withLogConsumer((stream) => {
      stream.on('data', (line) => console.log(line));
      stream.on('err', (line) => console.error(line));
      stream.on('end', () => console.log('Stream closed'));
    }) */
    .start();

  console.log('Code container started');

  // Hint: Use `globalThis` to pass variables to global teardown.
  Object.assign(globalThis, {
    authDatabaseContainer,
    cacheContainer,
    authCodeContainer,
  });
};
