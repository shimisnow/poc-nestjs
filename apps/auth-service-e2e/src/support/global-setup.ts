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
  const DOCKER_IMAGE_AUTH_SERVICE = 'shimisnow/pocnestjs-auth-service:latest';
  const DOCKER_POSTGRES_TAG = 'postgres:16.1';
  const DOCKER_REDIS_TAG = 'redis:7.2.4';

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
    'apps/auth-service/Dockerfile',
  ).build(DOCKER_IMAGE_AUTH_SERVICE, {
    deleteOnExit: true,
  });

  /***** DEPENDENCIES SETUP *****/

  const postgreSqlContainer = new PostgreSqlContainer(DOCKER_POSTGRES_TAG)
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

  const redisContainer = new RedisContainer(DOCKER_REDIS_TAG)
    .withLabels({ 'poc-nestjs-name': 'auth-service-cache' })
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
    .start();

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.containerDatabase = containerDatabase;
  globalThis.containerCache = containerCache;
  globalThis.containerCode = containerCode;
};
