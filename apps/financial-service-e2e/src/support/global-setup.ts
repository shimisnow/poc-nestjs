import { GenericContainer, Network, StartedTestContainer, Wait } from 'testcontainers';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';

module.exports = async function () {
  const DOCKER_IMAGE_BUILD_NAME = 'poc-nestjs-node';
  const DOCKER_POSTGRES_TAG = 'postgres:16.1';
  const DOCKER_REDIS_TAG = 'redis:7.2.4';
  
  const dockerNetwork = await new Network().start();

  /***** DATABASE *****/

  const postgreSqlContainer = new PostgreSqlContainer(DOCKER_POSTGRES_TAG)
    .withNetwork(dockerNetwork)
    .withNetworkAliases('database-financial')
    .withDatabase(process.env.DATABASE_FINANCIAL_DBNAME)
    .withUsername(process.env.DATABASE_FINANCIAL_USERNAME)
    .withPassword(process.env.DATABASE_FINANCIAL_PASSWORD)
    // copy SQL files to populate the database
    .withCopyDirectoriesToContainer([{
      source: './apps/financial-service-e2e/dependencies/database',
      target: '/docker-entrypoint-initdb.d',
    }])
    .withWaitStrategy(Wait.forLogMessage('PostgreSQL init process complete; ready for start up.'));

  /***** CACHE *****/

  const redisContainer = new RedisContainer(DOCKER_REDIS_TAG)
    .withLabels({ 'poc-nestjs-name': 'financial-service-cache' })
    .withNetwork(dockerNetwork)
    .withNetworkAliases('redis')
    .withExposedPorts(parseInt(process.env.REDIS_PORT));

  /***** DEPENDENCIES START AND CODE BUILD *****/

  const [
    containerDatabase,
    containerCache,
    buildContainerCode,
  ] = await Promise.all([
    postgreSqlContainer.start(),
    redisContainer.start(),
    // build docker image with compiled code
    GenericContainer
      .fromDockerfile('./')
      .build(DOCKER_IMAGE_BUILD_NAME, { deleteOnExit: false })
  ]);

  /***** CODE *****/

  const containerCode: StartedTestContainer = await buildContainerCode
    .withLabels({ 'poc-nestjs-name': 'financial-service-code' })
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

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.containerDatabase = containerDatabase;
  globalThis.containerCache = containerCache;
  globalThis.containerCode = containerCode;
};
