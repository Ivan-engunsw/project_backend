import request from 'sync-request-curl';
import { port, url } from '../config.json';

const ERROR = { error: expect.any(String) };
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

const inputUser2 = {
  json: {
    email: 'validemail2@gmail.com',
    password: 'password1!',
    nameFirst: 'Bobby',
    nameLast: 'Bob'
  },
  timeout: TIMEOUT_MS
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', {
    timeout: TIMEOUT_MS
  });
});

describe('POST /v1/admin/auth/register', () => {
  describe('Error Testing', () => {
    test('Email already in use', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register', inputUser);
      const res2 = request('POST', SERVER_URL + '/v1/admin/auth/register', inputUser);
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        token: expect.any(String)
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('Email is invalid', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: '!',
          password: 'password1!',
          nameFirst: 'Bobby',
          nameLast: 'Bob'
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('NameFirst is invalid', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'validemail1@gmail.com',
          password: 'password1!',
          nameFirst: '!',
          nameLast: 'Bob'
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('NameLast is invalid', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'validemail1@gmail.com',
          password: 'password1!',
          nameFirst: 'Bobby',
          nameLast: '!'
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Password is invalid', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'validemail1@gmail.com',
          password: 'p',
          nameFirst: 'Bobby',
          nameLast: 'Bob'
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });
  });

  describe('Functionality testing', () => {
    test('Has the correct return type for one user', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register', inputUser);
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        token: expect.any(String)
      });
    });

    test('Check different tokens are assigned to users', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register', inputUser);
      const res2 = request('POST', SERVER_URL + '/v1/admin/auth/register', inputUser2);
      expect(JSON.parse(res2.body.toString())).not.toStrictEqual(res.body.toString());
    });

    test('Successfully creates a user', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register', inputUser);
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
          numFailedPasswordsSinceLastLogin: expect.any(Number)
        }
      });
    });

    test('Successfully creates multiple users', () => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register', inputUser);
      const res2 = request('POST', SERVER_URL + '/v1/admin/auth/register', inputUser2);
      const token: {
        token: string
      } = JSON.parse(res.body.toString());
      const token2: {
        token: string
      } = JSON.parse(res2.body.toString());

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
          numFailedPasswordsSinceLastLogin: expect.any(Number)
        }
      });

      const desc2 = request('GET', SERVER_URL + '/v1/admin/user/details', {
        qs: {
          token: token2.token
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(desc2.body.toString())).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Bobby Bob',
          email: 'validemail2@gmail.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number)
        }
      });
    });
  });
});
