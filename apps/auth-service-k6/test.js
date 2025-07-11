import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '1m',
};

export default () => {
  const response = http.post(
    'http://localhost:3001/auth/login',
    JSON.stringify({
      username: 'anderson',
      password: 'test@1234',
      requestRefreshToken: false,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Version': '1',
      },
    },
  );
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response body contains expected text': (r) => {
      const body = JSON.parse(r.body);
      if (body.hasOwnProperty('accessToken') === false) {
        return false;
      }
      return true;
    },
  });
  sleep(1);
};
