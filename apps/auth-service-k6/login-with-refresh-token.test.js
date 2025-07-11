import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  tags: {
    service: 'auth',
    endpoint: 'login',
  },
  stages: [
    { duration: '30s', target: 100 }, // traffic ramp-up from 1 to 100 users over 30 seconds.
    { duration: '30s', target: 300 }, // ramp-up at 200 users for 30 seconds
    { duration: '15s', target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
  },
};

export default () => {
  const url = 'http://localhost:3001/auth/login';
  const headers = {
    'Content-Type': 'application/json',
    'X-Api-Version': '1',
  };
  const payload = {
    username: 'anderson',
    password: 'test@1234',
    requestRefreshToken: true,
  };

  const response = http.post(url, JSON.stringify(payload), { headers });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response body contains access and refresh token': (r) => {
      const body = JSON.parse(r.body);
      if (
        body.hasOwnProperty('accessToken') === false ||
        body.hasOwnProperty('refreshToken') === false
      ) {
        return false;
      }
      return true;
    },
  });

  sleep(1);
};
