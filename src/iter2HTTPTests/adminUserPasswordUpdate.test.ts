import request from 'sync-request-curl';
import { port, url } from '../config.json';

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('PUT /v1/admin/user/password', () => {
  test('Successfully updates the password', () => {
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

    const res2 = request('PUT', SERVER_URL + '/v1/admin/user/password', {
      json: {
        token,
        oldPassword: '1234zyx#@',
        newPassword: 'newpass1'
      },
      timeout: TIMEOUT_MS
    });

    expect(JSON.parse(res2.body.toString())).toStrictEqual({});
    expect(res2.statusCode).toStrictEqual(200);
  });

  describe('Error Testing', () => {
    test('Case when token is not valid', () => {
      const res = request('PUT', SERVER_URL + '/v1/admin/user/password', {
        json: {
          token: 'invalid-token',
          oldPassword: '1234zyx#@',
          newPassword: 'newpass1'
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Case when old password is incorrect', () => {
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

      const res2 = request('PUT', SERVER_URL + '/v1/admin/user/password', {
        json: {
          token,
          oldPassword: 'wrongpassword',
          newPassword: 'newpass1'
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('Case when old and new passwords match', () => {
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

      const res2 = request('PUT', SERVER_URL + '/v1/admin/user/password', {
        json: {
          token,
          oldPassword: '1234zyx#@',
          newPassword: '1234zyx#@'
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('Case when new password has already been used before', () => {
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

      request('PUT', SERVER_URL + '/v1/admin/user/password', {
        json: {
          token,
          oldPassword: '1234zyx#@',
          newPassword: 'newpass1'
        },
        timeout: TIMEOUT_MS
      });

      request('PUT', SERVER_URL + '/v1/admin/user/password', {
        json: {
          token,
          oldPassword: 'newpass1',
          newPassword: '12345abc'
        },
        timeout: TIMEOUT_MS
      });

      const res2 = request('PUT', SERVER_URL + '/v1/admin/user/password', {
        json: {
          token,
          oldPassword: '12345abc',
          newPassword: 'newpass1'
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('Case when new password is less than 8 characters', () => {
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

      const res2 = request('PUT', SERVER_URL + '/v1/admin/user/password', {
        json: {
          token,
          oldPassword: '1234zyx#@',
          newPassword: 'short'
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('Case when new password does not contain at least one number and one letter', () => {
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

      const res2 = request('PUT', SERVER_URL + '/v1/admin/user/password', {
        json: {
          token,
          oldPassword: '1234zyx#@',
          newPassword: 'abcdefgh'
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });
  });
});
