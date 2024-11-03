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
  const DOCKER_IMAGE_POCNESTJS_BASE_DEV = 'pocnestjs-base-dev';
  const DOCKER_IMAGE_POCNESTJS_BASE_PROD = 'pocnestjs-base-prod';
  const DOCKER_IMAGE_USER_SERVICE = 'shimisnow/pocnestjs-auth-service:latest';
  const DOCKER_POSTGRES_TAG = 'postgres:17.0';
  const DOCKER_REDIS_TAG = 'redis:7.4.1';

  const dockerNetwork: StartedNetwork = await new Network().start();

  /***** BUILD BASE DOCKER IMAGES *****/

  const [baseImageDev, baseImageProd] = await Promise.all([
    // build docker image with node_module for development
    GenericContainer.fromDockerfile('./')
      .withBuildArgs({ NODE_ENV: 'development' })
      .build(DOCKER_IMAGE_POCNESTJS_BASE_DEV, {
        deleteOnExit: false,
      }),
    // build docker image with node_module for production
    GenericContainer.fromDockerfile('./')
      .withBuildArgs({ NODE_ENV: 'production' })
      .build(DOCKER_IMAGE_POCNESTJS_BASE_PROD, {
        deleteOnExit: false,
      }),
  ]);

  /***** BUILD SERVICE DOCKER IMAGE *****/

  const serviceImage = await GenericContainer.fromDockerfile(
    './',
    'apps/user-service/Dockerfile',
  ).build(DOCKER_IMAGE_USER_SERVICE, {
    deleteOnExit: true,
  });

  /***** DEPENDENCIES SETUP *****/

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

  const redisContainer = new RedisContainer(DOCKER_REDIS_TAG)
    .withLabels({ 'poc-nestjs-name': 'user-service-cache' })
    .withNetwork(dockerNetwork)
    .withNetworkAliases('redis')
    .withExposedPorts(parseInt(process.env.REDIS_PORT));

  /***** DEPENDENCIES START *****/

  const [containerDatabase, containerCache] = await Promise.all([
    postgreSqlContainer.start(),
    redisContainer.start(),
  ]);

  /***** CODE *****/

  const containerCode: StartedTestContainer = await serviceImage
    .withLabels({ 'poc-nestjs-name': 'user-service-code' })
    .withNetwork(dockerNetwork)
    .withNetworkAliases('user-service')
    .withExposedPorts(parseInt(process.env.USER_SERVICE_PORT))
    .withEnvironment({
      DATABASE_USER_HOST: 'database-info',
      DATABASE_USER_PORT: '5432',
      DATABASE_USER_USERNAME: process.env.DATABASE_USER_USERNAME,
      DATABASE_USER_PASSWORD: process.env.DATABASE_USER_PASSWORD,
      DATABASE_USER_DBNAME: process.env.DATABASE_USER_DBNAME,
      REDIS_HOST: 'redis',
      REDIS_PORT: process.env.REDIS_PORT,
      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
      JWT_MAX_AGE: process.env.JWT_MAX_AGE,
      USER_SERVICE_PORT: process.env.USER_SERVICE_PORT,
      USER_SERVICE_LOG_DIR: './logs',
    })
    .start();

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.containerDatabase = containerDatabase;
  globalThis.containerCache = containerCache;
  globalThis.containerCode = containerCode;
};
