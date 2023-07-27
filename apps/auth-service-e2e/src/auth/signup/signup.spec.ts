import request from 'supertest';

describe('GET /auth/signup', () => {
  const host = `http://localhost:${process.env.AUTH_SERVICE_PORT}`;
  const endpoint = '/auth/signup';

  describe('API call WITHOUT errors', () => {
    test('User can be created', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          userId: 11,
          username: 'marta',
          password: 'test@1234',
        })
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
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(
        body.message.includes('username should not be empty')
      ).toBeTruthy();
    });

    test('ConflictResponse: duplicated user data', async () => {
      await request(host)
        .post(endpoint)
        .send({
          userId: 42,
          username: 'anderson',
          password: 'test@1234',
        })
        .expect('Content-Type', /json/)
        .expect(409);
    });
  });
});
