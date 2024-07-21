import request from 'sync-request-curl';
import { port, url } from '../config.json';

// CONSTANTS //
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
const INPUT_USER = {
  email: 'betty@unsw.com',
  password: 'password1',
  nameFirst: 'Betty',
  nameLast: 'Boop'
};
const ERROR = { error: expect.any(String) };

// HELPER FUNCTIONS //
const clear = () => {
  request('DELETE', SERVER_URL + '/v1/clear', {
    timeout: TIMEOUT_MS
  });
};

const adminAuthRegister =
(inputUser: {
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
}) => {
  return request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: inputUser,
    timeout: TIMEOUT_MS
  });
};

const adminAuthLogout = (token: string) => {
  return request('POST', SERVER_URL + '/v2/admin/auth/logout', {
    headers: {
      token: token
    },
    timeout: TIMEOUT_MS
  });
};

// TESTING //
beforeEach(() => {
  clear();
});

afterEach(() => {
  clear();
});

describe('POST /v1/admin/auth/logout', () => {
  let token: {
      token: string
    };
  beforeEach(() => {
    const res = adminAuthRegister(INPUT_USER);
    token = JSON.parse(res.body.toString());
  });

  describe('error testing', () => {
    test('returns an error for invalid token', () => {
      const res = adminAuthLogout(token.token + 1);
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = adminAuthLogout(token.token);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('token is successfully removed', () => {
      adminAuthLogout(token.token);
      const res = adminAuthLogout(token.token);
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('successfully logouts multiple users', () => {
      const inputUser2 = {
        email: 'norman@unsw.com',
        password: 'password1',
        nameFirst: 'Norman',
        nameLast: 'Nile'
      };
      const user2 = adminAuthRegister(inputUser2);
      const token2 = JSON.parse(user2.body.toString());

      const res1 = adminAuthLogout(token.token);
      expect(JSON.parse(res1.body.toString())).toStrictEqual({});

      const res2 = adminAuthLogout(token2.token);
      expect(JSON.parse(res2.body.toString())).toStrictEqual({});
    });
  });
});
