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
  const DOCKER_IMAGE_BUILD_NAME = 'poc-nestjs-node';
  const DOCKER_POSTGRES_TAG = 'postgres:16.1';
  const DOCKER_REDIS_TAG = 'redis:7.2.4';

  const dockerNetwork: StartedNetwork = await new Network().start();

  /***** DATABASE *****/

  const postgreSqlContainer = new PostgreSqlContainer(DOCKER_POSTGRES_TAG)
    .withNetwork(dockerNetwork)
    .withNetworkAliases('database-info')
    .withDatabase(process.env.DATABASE_USER_DBNAME)
    .withUsername(process.env.DATABASE_USER_USERNAME)
    .withPassword(process.env.DATABASE_USER_PASSWORD)
    // copy SQL files to populate the database
    .withCopyDirectoriesToContainer([
      {
        source: './apps/user-service-e2e/dependencies/database',
        target: '/docker-entrypoint-initdb.d',
      },
    ])
    .withWaitStrategy(
      Wait.forLogMessage(
        'PostgreSQL init process complete; ready for start up.',
      ),
    );

  /***** CACHE *****/

  const redisContainer = new RedisContainer(DOCKER_REDIS_TAG)
    .withLabels({ 'poc-nestjs-name': 'user-service-cache' })
    .withNetwork(dockerNetwork)
    .withNetworkAliases('redis')
    .withExposedPorts(parseInt(process.env.REDIS_PORT));

  /***** DEPENDENCIES START AND CODE BUILD *****/

  const [containerDatabase, containerCache, buildContainerCode] =
    await Promise.all([
      postgreSqlContainer.start(),
      redisContainer.start(),
      // build docker image with compiled code
      GenericContainer.fromDockerfile('./').build(DOCKER_IMAGE_BUILD_NAME, {
        deleteOnExit: false,
      }),
    ]);

  /***** CODE *****/

  const containerCode: StartedTestContainer = await buildContainerCode
    .withLabels({ 'poc-nestjs-name': 'user-service-code' })
    .withNetwork(dockerNetwork)
    .withNetworkAliases('user-service')
    .withExposedPorts(parseInt(process.env.USER_SERVICE_PORT))
    .withCopyFilesToContainer([
      {
        source: './dist/apps/user-service/main.js',
        target: '/home/node/app/main.js',
      },
    ])
    .withCommand(['node', 'main.js'])
    .withEnvironment({
      DATABASE_USER_HOST: 'database-info',
      DATABASE_USER_PORT: '5432',
      DATABASE_USER_USERNAME: process.env.DATABASE_USER_USERNAME,
      DATABASE_USER_PASSWORD: process.env.DATABASE_USER_PASSWORD,
      DATABASE_USER_DBNAME: process.env.DATABASE_USER_DBNAME,
      REDIS_HOST: 'redis',
      REDIS_PORT: process.env.REDIS_PORT,
      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
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
