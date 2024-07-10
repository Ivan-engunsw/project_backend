import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
const INPUT_USER = { email: 'betty@unsw.com', password: 'password1', nameFirst: 'Betty', nameLast: 'Boop' };
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('GET /v1/admin/user/details', () => {
  let token: { token: string };
  beforeEach(() => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: INPUT_USER, timeout: TIMEOUT_MS });
    token = JSON.parse(res.body.toString());
  });

  describe('error testing', () => {
    test('returns an error for invalid token', () => {
      const res = request('GET', SERVER_URL + '/v1/admin/user/details', { qs: { token: token.token + 1 }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = request('GET', SERVER_URL + '/v1/admin/user/details', { qs: token, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });

    test('correctly returns the user details of 1 user', () => {
      const res = request('GET', SERVER_URL + '/v1/admin/user/details', { qs: token, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Betty Boop',
          email: 'betty@unsw.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });

    test('correctly returns the user details of multiple users', () => {
      const inputUser2 = { email: 'norman@unsw.com', password: 'password1', nameFirst: 'Norman', nameLast: 'Nile' };
      const user2 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: inputUser2, timeout: TIMEOUT_MS });
      const token2 = JSON.parse(user2.body.toString());

      const res = request('GET', SERVER_URL + '/v1/admin/user/details', { qs: token, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Betty Boop',
          email: 'betty@unsw.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });

      const res2 = request('GET', SERVER_URL + '/v1/admin/user/details', { qs: token2, timeout: TIMEOUT_MS });
      expect(JSON.parse(res2.body.toString())).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Norman Nile',
          email: 'norman@unsw.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });
  });
});
