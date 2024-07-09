import request from 'sync-request-curl';
import { port, url } from './config.json';

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

const loginUser = {
    json: {
        email: 'validemail1@gmail.com',
        password: 'password1!',    
    }, 
    timeout: TIMEOUT_MS
};


beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('POST /v1/admin/auth/login', () => {
  describe('Error Testing', () => {
    test('Has incorrect email', () => {
      request('POST', SERVER_URL + '/v1/admin/auth/register', createUser);
      const res = request('POST', SERVER_URL + '/v1/admin/auth/login', loginUser);
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(JSON.parse(res.statusCode.toStrictEqual(400)));
    });
  });

  describe('Functionality testing', () => {
    test('Has the correct return type', () => {
      request('POST', SERVER_URL + '/v1/admin/auth/register', createUser);
      const res = request('POST', SERVER_URL + '/v1/admin/auth/login', 
        {
          json: {
              email: 'invalidEmail',
              password: 'password1!',    
          }, 
          timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual({ token: expect.any(String) });
    });
  });
});
