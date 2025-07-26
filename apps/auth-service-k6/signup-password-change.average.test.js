import http from 'k6/http';
import { check, sleep } from 'k6';
import { generateJwtToken } from './utils/jwt.js';

export const options = {
  tags: {
    service: 'auth',
    endpoint: 'signup',
  },
  stages: [
    { duration: '15s', target: 10 }, // traffic ramp-up from 1 to 100 users over 15 seconds.
    { duration: '15s', target: 300 }, // ramp-up at 200 users for 15 seconds
    { duration: '5s', target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    'checks{response_status:201}': ['rate==1.00'], // must be 100% successful
  },
};

export default () => {
  const JWT_SECRET_KEY = '09d9059c-23c1-4309-91c7-cda91abab092';
  const host = 'http://localhost:3001';
  const endpointSignup = '/auth/signup';
  const endpointPassword = '/auth/password';

  const headersSignup = {
    'Content-Type': 'application/json',
    'X-Api-Version': '1',
  };

  const payloadSignup = {
    username: `k6user${__VU}_${__ITER}`,
    password: 'test@1234',
  };

  const responseSignup = http.post(
    `${host}${endpointSignup}`,
    JSON.stringify(payloadSignup),
    {
      headers: headersSignup,
    },
  );

  console.log(responseSignup.body);

  check(responseSignup, {
    'status is 201': (r) => r.status === 201,
    'has user id': (r) => {
      const body = r.json();

      // verifies access token
      if (
        body.hasOwnProperty('status') === false ||
        body.hasOwnProperty('userId') === false ||
        body.userId.length === 0
      ) {
        return false;
      }

      return true;
    },
  });

  if (responseSignup.status !== 201) {
    return;
  }

  sleep(0.25);

  const userId = responseSignup.json().userId;

  const now = Math.floor(Date.now() / 1000);
  const accessToken = generateJwtToken(
    {
      userId,
      loginId: new Date().getTime().toString(),
      role: 'user',
      iat: now,
      exp: now + 60,
    },
    JWT_SECRET_KEY,
  );

  const headersPassword = {
    'Content-Type': 'application/json',
    'X-Api-Version': '1',
    Authorization: `Bearer ${accessToken}`,
  };

  const payloadPassword = {
    password: 'test@1234',
    newPassword: '1234@test',
  };

  const responsePassword = http.post(
    `${host}${endpointPassword}`,
    JSON.stringify(payloadPassword),
    {
      headers: headersPassword,
    },
  );

  check(responsePassword, {
    'status is 201': (r) => r.status === 201,
    'response contains information': (r) => {
      const body = r.json();
      if (body.hasOwnProperty('performed') === false) {
        return false;
      }
      return true;
    },
  });

  sleep(0.25);
};

// k6 run --out influxdb=http://localhost:8086/k6 .\apps\auth-service-k6\signup-password-change.average.test.js
