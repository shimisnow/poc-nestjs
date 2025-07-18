import request from 'supertest';
import { getContainerRuntimeClient } from 'testcontainers';

describe('GET /auth/signup', () => {
  let host: string;
  const endpoint = '/auth/signup';

  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCode = await containerRuntimeClient.container.fetchByLabel(
      'poc-nestjs-name',
      'auth-service-code',
    );
    const containerInfo = await containerCode.inspect();
    const AUTH_SERVICE_TEST_PORT =
      containerInfo.NetworkSettings.Ports[
        `${process.env.AUTH_SERVICE_PORT}/tcp`
      ][0].HostPort;
    host = `http://localhost:${AUTH_SERVICE_TEST_PORT}`;
  });

  describe('API call WITHOUT errors', () => {
    test('User can be created', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'marta',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body;

      expect(body).toHaveProperty('status');
      expect(body.status).toBeTruthy();
      expect(body).toHaveProperty('userId');
      expect(body.userId).not.toBe('');
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

    test('Username error by min length', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'a',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(body.message.length).toBe(1);
      expect(
        body.message.includes(
          'username must be longer than or equal to 2 characters',
        ),
      ).toBeTruthy();
    });

    test('Username error by max length', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'abcdefghijklmnopqrstu',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(body.message.length).toBe(1);
      expect(
        body.message.includes(
          'username must be shorter than or equal to 20 characters',
        ),
      ).toBeTruthy();
    });

    test('Username error by regex fail (not allowed character)', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'teste@teste',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(body.message.length).toBe(1);
      expect(
        body.message.includes(
          'only lowercase letters, digits and one underscore or period allowed',
        ),
      ).toBeTruthy();
    });

    test('Username error by regex fail (using _ and . at the same time)', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'teste.teste_teste',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(body.message.length).toBe(1);
      expect(
        body.message.includes(
          'only lowercase letters, digits and one underscore or period allowed',
        ),
      ).toBeTruthy();
    });

    test('ConflictResponse: duplicated user data (username)', async () => {
      await request(host)
        .post(endpoint)
        .send({
          username: 'anderson',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(409);
    });
  });
});
