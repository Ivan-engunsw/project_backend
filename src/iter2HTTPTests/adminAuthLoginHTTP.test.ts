import request from 'sync-request-curl';
import { port, url } from '../config.json';

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

const createUser = {
  json: {
    email: 'validemail1@gmail.com',
    password: 'password1!',
    nameFirst: 'Bobby',
    nameLast: 'Bob'
  },
  timeout: TIMEOUT_MS
};

const createUser2 = {
  json: {
    email: 'validemail2@gmail.com',
    password: 'password1!',
    nameFirst: 'Bobby',
    nameLast: 'Bob'
  },
  timeout: TIMEOUT_MS
};

const loginUser = {
  json: {
    email: 'validemail1@gmail.com',
    password: 'password1!',
  },
  timeout: TIMEOUT_MS
};
const loginUser2 = {
  json: {
    email: 'validemail1@gmail.com',
    password: 'password1!',
  },
  timeout: TIMEOUT_MS
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', {
    timeout: TIMEOUT_MS
  });
  request('POST', SERVER_URL + '/v1/admin/auth/register', createUser);
});

describe('POST /v1/admin/auth/login', () => {
  describe('Error Testing', () => {
    test('Has incorrect email', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
        json: {
          email: 'invalidEmail',
          password: 'password1!',
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Password does not match email', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
        json: {
          email: 'validemail1@gmail.com',
          password: 'PPP1',
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });
  });

  describe('Functionality testing', () => {
    test('Has the correct return type', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/login', loginUser);
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        token: expect.any(String)
      });
    });

    test('Check different tokens are assigned to users', () => {
      request('POST', SERVER_URL + '/v1/admin/auth/register', createUser2);
      const res = request('POST', SERVER_URL + '/v1/admin/auth/login', loginUser);
      const res2 = request('POST', SERVER_URL + '/v1/admin/auth/login', loginUser2);
      expect(JSON.parse(res2.body.toString())).not.toStrictEqual(res.body.toString());
    });

    test('Successfully logs in a user', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/login', loginUser);
      const token: {
        token: string
      } = JSON.parse(res.body.toString());
      const desc = request('GET', SERVER_URL + '/v1/admin/user/details', {
        qs: {
          token: token.token
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(desc.body.toString())).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Bobby Bob',
          email: 'validemail1@gmail.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });

    test('Successfully update numSuccessfullLogins', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/login', loginUser);
      const token: {
        token: string
      } = JSON.parse(res.body.toString());
      const desc = request('GET', SERVER_URL + '/v1/admin/user/details', {
        qs: {
          token: token.token
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(desc.body.toString())).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Bobby Bob',
          email: 'validemail1@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });

    test('Successfully update numFailedPasswordsSinceLastLogin', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register', createUser2);
      request('POST', SERVER_URL + '/v1/admin/auth/login', {
        json: {
          email: 'validemail2@gmail.com',
          password: 'wrongP1!',
        },
        timeout: TIMEOUT_MS
      });
      const token: {
        token: string
      } = JSON.parse(res.body.toString());
      const desc = request('GET', SERVER_URL + '/v1/admin/user/details', {
        qs: {
          token: token.token
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(desc.body.toString())).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Bobby Bob',
          email: 'validemail2@gmail.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: 1,
        }
      });
    });
  });
});
