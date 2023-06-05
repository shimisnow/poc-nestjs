import request from 'supertest';

describe('POST /auth/login', () => {
  const host = `http://localhost:${process.env.AUTH_SERVICE_PORT}`;
  const endpoint = '/auth/login';

  describe('API call WITHOUT errors', () => {
    test('User does not exists', async () => {
      await request(host)
        .post(endpoint)
        .send({
          username: 'thomas',
          password: 'test@1234',
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('User exists but it is inactive', async () => {
      await request(host)
        .post(endpoint)
        .send({
          username: 'ericka',
          password: 'test@1234',
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('User is active (wrong password)', async () => {
      await request(host)
        .post(endpoint)
        .send({
          username: 'anderson',
          password: 'password',
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('User is active (correct password)', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          username: 'anderson',
          password: 'test@1234',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body;

      expect(body).toHaveProperty('accessToken');
    });
  });

  describe('API call WITH errors', () => {
    test('BadRequestResponse: property should not exist', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          name: 'user',
        })
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
});
