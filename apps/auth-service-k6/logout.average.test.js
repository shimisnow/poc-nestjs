import http from 'k6/http';
import { check, sleep } from 'k6';
import { generateJwtToken } from './utils/jwt.js';

export const options = {
  tags: {
    service: 'auth',
    endpoint: 'logout',
  },
  stages: [
    { duration: '15s', target: 10 }, // traffic ramp-up from 1 to 100 users over 15 seconds.
    { duration: '15s', target: 300 }, // ramp-up at 200 users for 15 seconds
    { duration: '5s', target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    'checks{response_status:200}': ['rate==1.00'], // must be 100% successful
  },
};

export default () => {
  const JWT_SECRET_KEY = '09d9059c-23c1-4309-91c7-cda91abab092';
  const host = 'http://localhost:3001';
  const endpoint = '/auth/logout';

  const now = Math.floor(Date.now() / 1000);
  const accessToken = generateJwtToken(
    {
      // changes the last twelve digits for the user id based on VU id
      // this will generate cache entries as:
      // auth:logout:0197f9c5-2d4b-7570-af74-000000000003:1752244098409
      // auth:logout:0197f9c5-2d4b-7570-af74-000000000004:1752244098502
      userId: '0197f9c5-2d4b-7570-af74-' + String(__VU).padStart(12, '0'),
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

  const response = http.post(`${host}${endpoint}`, '', { headers });

  check(response, {
    'status is 200': (r) => r.status === 200,
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

// $env:K6_WEB_DASHBOARD_EXPORT="report.html" ; k6 run --out web-dashboard .\apps\auth-service-k6\logout.test.js
