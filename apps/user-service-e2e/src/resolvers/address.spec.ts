import request from 'supertest';
import { getContainerRuntimeClient } from 'testcontainers';

describe('Address Resolver', () => {
  let host: string;
  const endpoint = '/api';

  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCode = await containerRuntimeClient.container.fetchByLabel(
      'poc-nestjs-name',
      'user-service-code',
    );
    const containerInfo = await containerCode.inspect();
    const USER_SERVICE_TEST_PORT =
      containerInfo.NetworkSettings.Ports[
        `${process.env.USER_SERVICE_PORT}/tcp`
      ][0].HostPort;
    host = `http://localhost:${USER_SERVICE_TEST_PORT}`;
  });

  describe('authentication', () => {});

  describe('data request', () => {
    test('address exists (partial)', async () => {
      const response = await request(host)
        .post(endpoint)
        .send({
          query: `{
            address (addressId: 1) {
              postalcode
            }
          }`,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const result = response.body;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.address.postalcode');
      expect(Object.keys(result.data.address).length).toBe(1);
      expect(result.data.address.postalcode).toBe('12345678');
    });

    test('address exists (complete)', async () => {});

    test('address exists (error on field)', async () => {});

    test('address does not exists', async () => {});
  });
});
