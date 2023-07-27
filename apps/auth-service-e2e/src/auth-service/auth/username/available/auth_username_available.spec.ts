import request from 'supertest';

describe('GET /auth/username/available', () => {
  const host = `http://localhost:${process.env.AUTH_SERVICE_PORT}`;
  const endpoint = '/auth/username/available';

  console.log(host);
  console.log(endpoint);

  describe('API call WITHOUT errors', () => {
    test('Username available', async () => {
      const response = await request(host)
        .get(endpoint)
        .query({
          username: 'thomas',
        })
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
        .get(endpoint)
        .query({
          username: '',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body;

      expect(body).toHaveProperty('message');
      expect(body.message).toBeInstanceOf(Array);
      expect(body.message.length).toBe(1);
      expect(
        body.message.includes('username should not be empty')
      ).toBeTruthy();
    });
  });
});
