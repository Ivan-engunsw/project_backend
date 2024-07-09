import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
const INPUT_USER = { email: 'betty@unsw.com', password: 'password1', nameFirst: 'Betty', nameLast: 'Boop' };

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('GET /v1/admin/user/details', () => {
  let token: { token: string };
  beforeEach(() => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: INPUT_USER, timeout: TIMEOUT_MS });
    token = JSON.parse(res.body.toString());
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = request('GET', SERVER_URL + '/v1/admin/user/details', { qs: { token: token.token }, timeout: TIMEOUT_MS });
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
  });
});
