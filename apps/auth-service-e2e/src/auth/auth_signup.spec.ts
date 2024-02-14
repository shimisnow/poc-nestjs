import request from 'supertest';
import { getContainerRuntimeClient } from 'testcontainers';

describe('GET /auth/signup', () => {
  let host: string;
  const endpoint = '/auth/signup';

  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCode = await containerRuntimeClient.container.fetchByLabel('poc-nestjs-name', 'auth-service-code');
    const containerInfo = await containerCode.inspect();
    const AUTH_SERVICE_TEST_PORT = containerInfo.NetworkSettings.Ports[`${process.env.AUTH_SERVICE_PORT}/tcp`][0].HostPort;
    host = `http://localhost:${AUTH_SERVICE_TEST_PORT}`;
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
        .set('X-Api-Version', '1')
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
        .set('X-Api-Version', '1')
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
        .set('X-Api-Version', '1')
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
        .set('X-Api-Version', '1')
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
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(409);
    });
  });
});
