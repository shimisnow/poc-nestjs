import request from 'supertest';
import { getContainerRuntimeClient } from 'testcontainers';

describe('GET /auth/username/available', () => {
  let host: string;
  const endpoint = '/auth/username/available';

  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCode = await containerRuntimeClient.container.fetchByLabel('poc-nestjs-name', 'auth-service-code');
    const containerInfo = await containerCode.inspect();
    const AUTH_SERVICE_TEST_PORT = containerInfo.NetworkSettings.Ports[`${process.env.AUTH_SERVICE_PORT}/tcp`][0].HostPort;
    host = `http://localhost:${AUTH_SERVICE_TEST_PORT}`;
  });

  describe('API call WITHOUT errors', () => {
    test('Username available', async () => {
      const response = await request(host)
        .get(endpoint)
        .query({
          username: 'thomas',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body;

      expect(body).toHaveProperty('available');
      expect(body.available).toBeTruthy();
    });

    test('Username already in use', async () => {
      const response = await request(host)
        .get(endpoint)
        .query({
          username: 'anderson',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body;

      expect(body).toHaveProperty('available');
      expect(body.available).toBeFalsy();
    });
  });

  describe('API call WITH errors', () => {
    test('BadRequestResponse: property should not exist', async () => {
      const response = await request(host)
        .get(endpoint)
        .query({
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
        .get(endpoint)
        .query({
          username: '',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(body.message.length).toBe(1);
      expect(
        body.message.includes('username should not be empty'),
      ).toBeTruthy();
    });
  });
});
