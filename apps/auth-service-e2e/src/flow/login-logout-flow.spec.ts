import request from 'supertest';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { getContainerRuntimeClient } from 'testcontainers';

describe('login logout process (with refresh)', () => {
  let host: string;
  const endpointLogin = '/auth/login';
  const endpointLogout = '/auth/logout';
  const endpointRefresh = '/auth/refresh';
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
  const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCode = await containerRuntimeClient.container.fetchByLabel('poc-nestjs-name', 'auth-service-code');
    const containerInfo = await containerCode.inspect();
    const AUTH_SERVICE_TEST_PORT = containerInfo.NetworkSettings.Ports[`${process.env.AUTH_SERVICE_PORT}/tcp`][0].HostPort;
    host = `http://localhost:${AUTH_SERVICE_TEST_PORT}`;
  });

  test('simple login-logout with multiple sessions', async () => {

    /***** LOGIN *****/

    const sessionOne = await request(host)
      .post(endpointLogin)
      .send({
        username: 'anderson',
        password: 'test@1234',
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200);

    /* const sessionTwo = await request(host)
      .post(endpointLogin)
      .send({
        username: 'anderson',
        password: 'test@1234',
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200); */

    let sessionOneAccessToken = jsonwebtoken.verify(sessionOne.body.accessToken, JWT_SECRET_KEY) as JwtPayload;
    //let sessionTwoAccessToken = jsonwebtoken.verify(sessionTwo.body.accessToken, JWT_SECRET_KEY) as JwtPayload;
    const sessionOneRefreshToken = jsonwebtoken.verify(sessionOne.body.refreshToken, JWT_REFRESH_SECRET_KEY) as JwtPayload;
    //const sessionTwoRefreshToken = jsonwebtoken.verify(sessionTwo.body.refreshToken, JWT_REFRESH_SECRET_KEY) as JwtPayload;

    expect(sessionOneAccessToken.userId).toBe(sessionOneRefreshToken.userId);
    expect(sessionOneAccessToken.iss).toBe(sessionOneRefreshToken.iss);
    //expect(sessionTwoAccessToken.userId).toBe(sessionTwoRefreshToken.userId);
    //expect(sessionTwoAccessToken.iss).toBe(sessionTwoRefreshToken.iss);
    //expect(sessionOneAccessToken.iss).not.toBe(sessionTwoAccessToken.iss);
    //expect(sessionOneRefreshToken.userId).toBe(sessionTwoRefreshToken.userId);

    console.log('sessionOneAccessToken');
    console.log(sessionOneAccessToken);
    //console.log('sessionTwoAccessToken');
    //console.log(sessionTwoAccessToken);
    console.log('sessionOneRefreshToken');
    console.log(sessionOneRefreshToken);
    //console.log('sessionTwoRefreshToken');
    //console.log(sessionTwoRefreshToken);

    /***** REFRESH *****/

    await new Promise(resolve => setTimeout(resolve, 2000));

    let refreshSessionOne = await request(host)
      .get(endpointRefresh)
      .set('Authorization', `Bearer ${sessionOne.body.refreshToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200);

    /* let refreshSessionTwo = await request(host)
      .get(endpointRefresh)
      .set('Authorization', `Bearer ${sessionTwo.body.refreshToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200); */

    sessionOneAccessToken = jsonwebtoken.verify(refreshSessionOne.body.accessToken, JWT_SECRET_KEY) as JwtPayload;
    //sessionTwoAccessToken = jsonwebtoken.verify(refreshSessionTwo.body.accessToken, JWT_SECRET_KEY) as JwtPayload;

    console.log('sessionOneAccessToken x2');
    console.log(sessionOneAccessToken);
    //console.log('sessionTwoAccessToken x2');
    //console.log(sessionTwoAccessToken);

    expect(sessionOneAccessToken.iss).toBe(sessionOneRefreshToken.iss);
    //expect(sessionTwoAccessToken.iss).toBe(sessionTwoRefreshToken.iss);

    /***** SESSION ONE LOGOUT *****/

    await request(host)
      .post(endpointLogout)
      .set('Authorization', `Bearer ${refreshSessionOne.body.accessToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body).toHaveProperty('performed');
        expect(body.performed).toBeTruthy();
        expect(body).toHaveProperty('performedAt');
      });

    /***** SESSION ONE TRY TO REFRESH *****/

    refreshSessionOne = await request(host)
      .get(endpointRefresh)
      .set('Authorization', `Bearer ${sessionOne.body.refreshToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(401)
      .then(response => {
        const body = response.body;
        expect(body.data.name).toBe('TokenInvalidatedByServer');
        expect(body.data.errors).toEqual(expect.arrayContaining(['invalidated by logout']));
      });

    /***** SESSION TWO REFRESH *****/

    /* refreshSessionTwo = await request(host)
    .get(endpointRefresh)
    .set('Authorization', `Bearer ${sessionTwo.body.refreshToken}`)
    .set('X-Api-Version', '1')
    .expect('Content-Type', /json/)
    .expect(200);

    expect(refreshSessionTwo.body).toHaveProperty('accessToken'); */
  });
});