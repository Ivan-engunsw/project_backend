import request, { HttpVerb } from 'sync-request-curl';
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
  return request('POST', SERVER_URL + `/v1/admin/auth/register`, {
    json: inputUser,
    timeout: TIMEOUT_MS
  });
};

const adminUserDetails = (token: string) => {
  return request('GET', SERVER_URL + '/v2/admin/user/details', {
    headers: {
      token: token
    },
    timeout: TIMEOUT_MS
  });
};

beforeEach(() => {
  clear();
});

describe('GET /v1/admin/user/details', () => {
  let token: {
    token: string
  };
  beforeEach(() => {
    const res = adminAuthRegister(INPUT_USER);
    token = JSON.parse(res.body.toString());
  });

  describe('error testing', () => {
    test('returns an error for invalid token', () => {
      const res = adminUserDetails(token.token + 1)
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = adminUserDetails(token.token)
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
      const res = adminUserDetails(token.token);
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
      const inputUser2 = {
        email: 'norman@unsw.com',
        password: 'password1',
        nameFirst: 'Norman',
        nameLast: 'Nile'
      };
      const user2 = adminAuthRegister(inputUser2);
      const token2 = JSON.parse(user2.body.toString());

      const res = adminUserDetails(token.token);
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Betty Boop',
          email: 'betty@unsw.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });

      const res2 = adminUserDetails(token2.token);
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
