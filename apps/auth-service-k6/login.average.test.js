import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  tags: {
    service: 'auth',
    endpoint: 'login',
  },
  stages: [
    { duration: '15s', target: 100 }, // traffic ramp-up from 1 to 100 users over 15 seconds.
    { duration: '15s', target: 300 }, // ramp-up at 200 users for 15 seconds
    { duration: '5s', target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    'checks{response_status:200}': ['rate==1.00'], // must be 100% successful
  },
};

export default () => {
  const host = 'http://localhost:3001';
  const endpoint = '/auth/login';

  const headers = {
    'Content-Type': 'application/json',
    'X-Api-Version': '1',
  };

  // randomly makes requests with and without refresh tokens
  const requestRefreshToken = Math.random() < 0.5;

  const payload = {
    username: 'anderson',
    password: 'test@1234',
    requestRefreshToken,
  };

  const response = http.post(`${host}${endpoint}`, JSON.stringify(payload), {
    headers,
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'has expected token': (r) => {
      const body = r.json();

      // verifies access token
      if (
        body.hasOwnProperty('accessToken') === false ||
        body.accessToken.length === 0
      ) {
        return false;
      }

      // verifies refresh token
      if (requestRefreshToken) {
        if (
          body.hasOwnProperty('refreshToken') === false ||
          body.refreshToken.length === 0
        ) {
          return false;
        }
      }

      return true;
    },
  });

  sleep(0.25);
};

// k6 run --out influxdb=http://localhost:8086/k6 .\apps\auth-service-k6\login.average.test.js
