import request from 'sync-request-curl';
import { port, url } from './config.json';

// const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

const inputUser = {
  json: {
    email: 'validemail1@gmail.com',
    password: 'password1!',
    nameFirst: 'Bobby',
    nameLast: 'Bob'
  },
  timeout: TIMEOUT_MS
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('POST /v1/admin/auth/register', () => {
  describe('Functionality testing', () => {
    test('Has the correct return type', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register', inputUser);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ token: expect.any(String) });
    });
  });
});
