import request from 'supertest';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { getContainerRuntimeClient } from 'testcontainers';
import { AuthErrorNames } from '@shared/authentication/enums/auth-error-names.enum';
import { AuthErrorMessages } from '@shared/authentication/enums/auth-error-messages.enum';
describe('login logout process (with refresh)', () => {
  let host: string;
  const endpointLogin = '/auth/login';
  const endpointLogout = '/auth/logout';
  const endpointRefresh = '/auth/refresh';
  const endpointPassword = '/auth/password';
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
  const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    const containerCode = await containerRuntimeClient.container.fetchByLabel('poc-nestjs-name', 'auth-service-code');
    const containerInfo = await containerCode.inspect();
    const AUTH_SERVICE_TEST_PORT = containerInfo.NetworkSettings.Ports[`${process.env.AUTH_SERVICE_PORT}/tcp`][0].HostPort;
    host = `http://localhost:${AUTH_SERVICE_TEST_PORT}`;
  });

  test('login and password change with multiple sessions', async () => {

    /***** LOGIN *****/

    let sessionOne = await request(host)
      .post(endpointLogin)
      .send({
        username: 'yara',
        password: 'test@1234',
        requestAccessToken: true,
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200);

    const sessionTwo = await request(host)
      .post(endpointLogin)
      .send({
        username: 'yara',
        password: 'test@1234',
        requestAccessToken: true,
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200);

      const sessionThree = await request(host)
      .post(endpointLogin)
      .send({
        username: 'yara',
        password: 'test@1234',
        requestAccessToken: true,
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200);

    const sessionFour = await request(host)
      .post(endpointLogin)
      .send({
        username: 'markleid',
        password: 'test@1234',
        requestAccessToken: true,
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200);

    /***** PASSWORD CHANGE AT SESSION ONE *****/

    const passwordChangeResult = await request(host)
      .post(endpointPassword)
      .send({
        currentPassword: 'test@1234',
        newPassword: '1234@test',
      })
      .set('Authorization', `Bearer ${sessionOne.body.accessToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(201);

    expect(passwordChangeResult.body).toHaveProperty('performed');
    expect(passwordChangeResult.body.performed).toBeTruthy();
    expect(passwordChangeResult.body).toHaveProperty('accessToken');
    expect(passwordChangeResult.body).toHaveProperty('refreshToken');
    expect(passwordChangeResult.body.accessToken).not.toBe(passwordChangeResult.body.refreshToken);

    const passwordChangeAccessToken = jsonwebtoken.verify(passwordChangeResult.body.accessToken, JWT_SECRET_KEY) as JwtPayload;
    const passwordChangeRefreshToken = jsonwebtoken.verify(passwordChangeResult.body.refreshToken, JWT_REFRESH_SECRET_KEY) as JwtPayload;

    expect(passwordChangeAccessToken.userId).toBe(passwordChangeRefreshToken.userId);
    expect(passwordChangeAccessToken.loginId).toBe(passwordChangeRefreshToken.loginId);

    /***** REFRESH TOKEN AT SESSION TWO (ERROR) *****/

    await request(host)
      .get(endpointRefresh)
      .set('Authorization', `Bearer ${sessionTwo.body.refreshToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(401)
      .then(response => {
        const body = response.body;
        expect(body.data.name).toBe(AuthErrorNames.JWT_INVALIDATED_BY_SERVER);
        expect(body.data.errors).toEqual(expect.arrayContaining([AuthErrorMessages.INVALIDATED_BY_PASSWORD_CHANGE]));
      });

    /***** LOGOUT AT SESSION THREE (ERROR) *****/

    await request(host)
      .post(endpointLogout)
      .set('Authorization', `Bearer ${sessionThree.body.accessToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(401)
      .then(response => {
        const body = response.body;
        expect(body.data.name).toBe(AuthErrorNames.JWT_INVALIDATED_BY_SERVER);
        expect(body.data.errors).toEqual(expect.arrayContaining([AuthErrorMessages.INVALIDATED_BY_PASSWORD_CHANGE]));
      });

    /***** LOGOUT AT SESSION FOUR (OK - IT IS ANOTHER USER) *****/

    await request(host)
      .post(endpointLogout)
      .set('Authorization', `Bearer ${sessionFour.body.accessToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body).toHaveProperty('performed');
        expect(body.performed).toBeTruthy();
        expect(body).toHaveProperty('performedAt');
      });

    /***** LOGOUT AT SESSION ONE (OK) *****/

    await request(host)
      .post(endpointLogout)
      .set('Authorization', `Bearer ${passwordChangeResult.body.accessToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body).toHaveProperty('performed');
        expect(body.performed).toBeTruthy();
        expect(body).toHaveProperty('performedAt');
      });

    /***** LOGIN WITH THE NEW PASSWORD *****/

    // sleeps for two seconds to ensure that the password change and new login will not be at the same second
    await new Promise(response => setTimeout(response, 2000));

    sessionOne = await request(host)
      .post(endpointLogin)
      .send({
        username: 'yara',
        password: '1234@test',
      })
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200);

    /***** LOGOUT FROM THE NEW PASSWORD *****/

    await request(host)
      .post(endpointLogout)
      .set('Authorization', `Bearer ${sessionOne.body.accessToken}`)
      .set('X-Api-Version', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const body = response.body;
        expect(body).toHaveProperty('performed');
        expect(body.performed).toBeTruthy();
        expect(body).toHaveProperty('performedAt');
      });
  });
});