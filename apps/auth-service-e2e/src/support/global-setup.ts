/* eslint-disable */
import { GenericContainer, Network, StartedNetwork, StartedTestContainer, Wait } from 'testcontainers';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';

module.exports = async function () {
  const DOCKER_IMAGE_BUILD_NAME = 'poc-nestjs-node';
  const DOCKER_POSTGRES_TAG = 'postgres:16.1';
  const DOCKER_REDIS_TAG = 'redis:7.2.4';

  let dockerNetwork: StartedNetwork;
  let containerDatabase: StartedPostgreSqlContainer;
  let containerCache: StartedRedisContainer;
  let containerCode: StartedTestContainer;

  dockerNetwork = await new Network().start();

  containerDatabase = await new PostgreSqlContainer(DOCKER_POSTGRES_TAG)
    .withNetwork(dockerNetwork)
    .withNetworkAliases('database-authentication')
    .withDatabase(process.env.DATABASE_AUTH_DBNAME)
    .withUsername(process.env.DATABASE_AUTH_USERNAME)
    .withPassword(process.env.DATABASE_AUTH_PASSWORD)
    // copy SQL files to populate the database
    .withCopyDirectoriesToContainer([{
      source: './apps/auth-service-e2e/dependencies/database',
      target: '/docker-entrypoint-initdb.d',
    }])
    .withWaitStrategy(Wait.forLogMessage('PostgreSQL init process complete; ready for start up.'))
    .start();

  /***** CACHE *****/

  containerCache = await new RedisContainer(DOCKER_REDIS_TAG)
    .withLabels({ 'poc-nestjs-name': 'auth-service-cache' })
    .withNetwork(dockerNetwork)
    .withNetworkAliases('redis')
    .withExposedPorts(parseInt(process.env.REDIS_PORT))
    .start();

  const buildContainerCode = await GenericContainer
    .fromDockerfile('./')
    .build(DOCKER_IMAGE_BUILD_NAME, { deleteOnExit: false });

  containerCode = await buildContainerCode
    .withLabels({ 'poc-nestjs-name': 'auth-service-code' })
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
      REDIS_HOST: 'redis',
      REDIS_PORT: process.env.REDIS_PORT,
      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      JWT_REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY,
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
      JWT_REFRESH_MAX_AGE: process.env.JWT_REFRESH_MAX_AGE,
      AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT,
      AUTH_SERVICE_LOG_DIR: './logs',
    })
    .start();

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.containerDatabase = containerDatabase;
  globalThis.containerCache = containerCache;
  globalThis.containerCode = containerCode;
};
