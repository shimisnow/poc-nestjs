import request from 'supertest';
import jsonwebtoken from 'jsonwebtoken';
import { getContainerRuntimeClient } from "testcontainers";

describe('POST /auth/login', () => {
  let host: string;
  const endpoint = '/auth/login';
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCode = await containerRuntimeClient.container.fetchByLabel('poc-nestjs-name', 'auth-service-code');
    const containerInfo = await containerCode.inspect();
    const AUTH_SERVICE_TEST_PORT = containerInfo.NetworkSettings.Ports[`${process.env.AUTH_SERVICE_PORT}/tcp`][0].HostPort;
    host = `http://localhost:${AUTH_SERVICE_TEST_PORT}`;
  });

  describe('authentication errors', () => {
    test('User does not exists', async () => {
      await request(host)
        .post(endpoint)
        .send({
          username: 'thomas',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then(response => {
          const body = response.body;
          expect(body.data.name).toBe('UserPasswordError');
          expect(body.data.errors).toEqual(expect.arrayContaining(['wrong user or password information']));
        });
    });

    test('User exists but it is inactive', async () => {
      await request(host)
        .post(endpoint)
        .send({
          username: 'ericka',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then(response => {
          const body = response.body;
          expect(body.data.name).toBe('UserPasswordError');
          expect(body.data.errors).toEqual(expect.arrayContaining(['wrong user or password information']));
        });
    });

    test('User is active (wrong password)', async () => {
      await request(host)
        .post(endpoint)
        .send({
          username: 'anderson',
          password: 'password',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(401)
        .then(response => {
          const body = response.body;
          expect(body.data.name).toBe('UserPasswordError');
          expect(body.data.errors).toEqual(expect.arrayContaining(['wrong user or password information']));
        });
    });
  });

  describe('request with errors', () => {
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
        body.message.includes('property name should not exist')
      ).toBeTruthy();
    });

    test('BadRequestResponse: error validating request input data', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: '',
          password: '',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(body.message.length).toBe(2);
      expect(
        body.message.includes('username should not be empty')
      ).toBeTruthy();
    });
  });

  describe('request without errors', () => {
    test('User is active (correct password)', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'anderson',
          password: 'test@1234',
        })
        .set('X-Api-Version', '1')
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body;

      expect(body).toHaveProperty('accessToken');
      // throws "JsonWebTokenError: invalid signature" if token is invalid
      jsonwebtoken.verify(body.accessToken, JWT_SECRET_KEY);
    });
  });
});
