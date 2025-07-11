import http from 'k6/http';
import { check, sleep } from 'k6';
import { generateJwtHMAC } from './utils/jwt.js';

export const options = {
  tags: {
    service: 'auth',
    endpoint: 'logout',
  },
  stages: [
    { duration: '30s', target: 10 }, // traffic ramp-up from 1 to 100 users over 30 seconds.
    //{ duration: '30s', target: 300 }, // ramp-up at 200 users for 30 seconds
    //{ duration: '15s', target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
  },
};

export default () => {
  const JWT_SECRET_KEY = '09d9059c-23c1-4309-91c7-cda91abab092';
  const url = 'http://localhost:3001/auth/logout';

  const now = Math.floor(Date.now() / 1000);
  const accessToken = generateJwtHMAC(
    {
      // changes the last three digits for the user id based on VU id
      userId:
        '0197f9c5-2d4b-7570-af74-11ab8181a' + String(__VU).padStart(3, '0'),
      loginId: new Date().getTime().toString(),
      role: 'user',
      iat: now,
      exp: now + 60,
    },
    JWT_SECRET_KEY,
  );

  const headers = {
    'Content-Type': 'application/json',
    'X-Api-Version': '1',
    Authorization: `Bearer ${accessToken}`,
  };

  console.log(accessToken);

  const response = http.post(url, '', { headers });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response body contains performed information': (r) => {
      const body = JSON.parse(r.body);
      if (body.hasOwnProperty('performed') === false) {
        return false;
      }
      return true;
    },
  });

  sleep(1);
};

// $env:K6_WEB_DASHBOARD_EXPORT="report.html" ; k6 run --out web-dashboard .\apps\auth-service-k6\logout.test.js
