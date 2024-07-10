import request from 'sync-request-curl';
import { port, url } from './config.json';

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('PUT /v1/admin/user/details', () => {
  test('Successfully updates user details', () => {
    const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'originalemail@gmail.com',
        password: '1234zyx#@',
        nameFirst: 'Betty',
        nameLast: 'Boop'
      },
      timeout: TIMEOUT_MS
    });
    const { token } = JSON.parse(res1.body.toString());

    const res2 = request('PUT', SERVER_URL + '/v1/admin/user/details', {
      json: {
        token,
        email: 'Updatedemail@gmail.com',
        nameFirst: 'Bratty',
        nameLast: 'Dorp'
      },
      timeout: TIMEOUT_MS
    });

    expect(JSON.parse(res2.body.toString())).toStrictEqual({});
    expect(res2.statusCode).toStrictEqual(200);
  });

  describe('Error Testing', () => {
    test('Case when token is not valid', () => {
      const res = request('PUT', SERVER_URL + '/v1/admin/user/details', {
        json: {
          token: 'invalid-token',
          email: 'Updatedemail@gmail.com',
          nameFirst: 'Bratty',
          nameLast: 'Dorp'
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Case when email is invalid', () => {
      const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'originalemail@gmail.com',
          password: '1234zyx#@',
          nameFirst: 'Betty',
          nameLast: 'Boop'
        },
        timeout: TIMEOUT_MS
      });
      const { token } = JSON.parse(res1.body.toString());

      const res2 = request('PUT', SERVER_URL + '/v1/admin/user/details', {
        json: {
          token,
          email: 'invalid-email',
          nameFirst: 'Bratty',
          nameLast: 'Dorp'
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('Case when email is used by another user', () => {
      const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'originalemail@gmail.com',
          password: '1234zyx#@',
          nameFirst: 'Betty',
          nameLast: 'Boop'
        },
        timeout: TIMEOUT_MS
      });
      const { token } = JSON.parse(res1.body.toString());

      request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'anotheremail@gmail.com',
          password: '1234zyx#@',
          nameFirst: 'Jane',
          nameLast: 'Dorp'
        },
        timeout: TIMEOUT_MS
      });

      const res2 = request('PUT', SERVER_URL + '/v1/admin/user/details', {
        json: {
          token,
          email: 'anotheremail@gmail.com',
          nameFirst: 'Bratty',
          nameLast: 'Dorp'
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test.each([
      { nameFirst: 'Br@tty' },
      { nameFirst: 'Br55TTy' },
    ])('Case when nameFirst contains invalid characters', ({ nameFirst }) => {
      const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'originalemail@gmail.com',
          password: '1234zyx#@',
          nameFirst: 'Betty',
          nameLast: 'Boop'
        },
        timeout: TIMEOUT_MS
      });
      const { token } = JSON.parse(res1.body.toString());

      const res2 = request('PUT', SERVER_URL + '/v1/admin/user/details', {
        json: {
          token,
          email: 'Updatedemail@gmail.com',
          nameFirst,
          nameLast: 'Dorp'
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('Case when nameFirst is less than 2 characters', () => {
      const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'originalemail@gmail.com',
          password: '1234zyx#@',
          nameFirst: 'Betty',
          nameLast: 'Boop'
        },
        timeout: TIMEOUT_MS
      });
      const { token } = JSON.parse(res1.body.toString());

      const res2 = request('PUT', SERVER_URL + '/v1/admin/user/details', {
        json: {
          token,
          email: 'Updatedemail@gmail.com',
          nameFirst: 'B',
          nameLast: 'Dorp'
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('Case when nameFirst is more than 20 characters', () => {
      const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'originalemail@gmail.com',
          password: '1234zyx#@',
          nameFirst: 'Betty',
          nameLast: 'Boop'
        },
        timeout: TIMEOUT_MS
      });
      const { token } = JSON.parse(res1.body.toString());

      const res2 = request('PUT', SERVER_URL + '/v1/admin/user/details', {
        json: {
          token,
          email: 'Updatedemail@gmail.com',
          nameFirst: 'B'.repeat(21),
          nameLast: 'Dorp'
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test.each([
      { nameLast: 'Do@p' },
      { nameLast: 'D3op' },
    ])('Case when nameLast contains invalid characters', ({ nameLast }) => {
      const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'originalemail@gmail.com',
          password: '1234zyx#@',
          nameFirst: 'Betty',
          nameLast: 'Boop'
        },
        timeout: TIMEOUT_MS
      });
      const { token } = JSON.parse(res1.body.toString());

      const res2 = request('PUT', SERVER_URL + '/v1/admin/user/details', {
        json: {
          token,
          email: 'Updatedemail@gmail.com',
          nameFirst: 'Bratty',
          nameLast
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('Case when nameLast is less than 2 characters', () => {
      const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'originalemail@gmail.com',
          password: '1234zyx#@',
          nameFirst: 'Betty',
          nameLast: 'Boop'
        },
        timeout: TIMEOUT_MS
      });
      const { token } = JSON.parse(res1.body.toString());

      const res2 = request('PUT', SERVER_URL + '/v1/admin/user/details', {
        json: {
          token,
          email: 'Updatedemail@gmail.com',
          nameFirst: 'Bratty',
          nameLast: 'D'
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('Case when nameLast is more than 20 characters', () => {
      const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'originalemail@gmail.com',
          password: '1234zyx#@',
          nameFirst: 'Betty',
          nameLast: 'Boop'
        },
        timeout: TIMEOUT_MS
      });
      const { token } = JSON.parse(res1.body.toString());

      const res2 = request('PUT', SERVER_URL + '/v1/admin/user/details', {
        json: {
          token,
          email: 'Updatedemail@gmail.com',
          nameFirst: 'Bratty',
          nameLast: 'D'.repeat(21)
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });
  });
});
