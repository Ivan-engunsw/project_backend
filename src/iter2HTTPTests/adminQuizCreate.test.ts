import request from 'sync-request-curl';
import { port, url } from '../config.json';

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('POST /v1/admin/quiz', () => {
  test('Token is non-existent', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token: '0',
          name: 'Betty boop quiz',
          description: 'Quiz for Betty boop'
        },
        timeout: TIMEOUT_MS
      });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  describe('After creating tokens', () => {
    let token: {token: string};
    beforeEach(() => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register',
        {
          json: {
            email: 'bettyBoop@gmail.com',
            password: 'helloWorld1',
            nameFirst: 'Betty',
            nameLast: 'Boop'
          },
          timeout: TIMEOUT_MS
        });
      token = JSON.parse(res.body.toString());
    });

    test('Token is not a valid token', () => {
      const res1 = request('POST', SERVER_URL + '/v1/admin/quiz',
        {
          json: {
            token: token.token + '1',
            name: 'Betty boop quiz',
            description: 'Quiz for Betty boop'
          },
          timeout: TIMEOUT_MS
        });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(401);
    });

    test.each([
      { name: 'He@rt quiz', description: 'Quiz for He@rt' },
      { name: 'He##rt quiz', description: 'Quiz for He##rt' },
      { name: 'H!@rt quiz', description: 'Quiz for H!@rt' },
    ])('name containing invalid characters "$name"', ({ name, description }) => {
      const res1 = request('POST', SERVER_URL + '/v1/admin/quiz',
        {
          json: { token: token.token, name: name, description: description },
          timeout: TIMEOUT_MS
        });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);
    });

    test.each([
      { name: 'He', description: 'Quiz for He' },
      { name: 'a'.repeat(31), description: 'a'.repeat(31) },
    ])('names that are of invalid length "$name"', ({ name, description }) => {
      const res1 = request('POST', SERVER_URL + '/v1/admin/quiz',
        {
          json: { token: token.token, name: name, description: description },
          timeout: TIMEOUT_MS
        });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);
    });

    test('name already used for another quiz', () => {
      request('POST', SERVER_URL + '/v1/admin/quiz', {
        json: {
          token: token.token,
          name: 'Betty boop quiz',
          description: 'Quiz for Betty boop'
        },
        timeout: TIMEOUT_MS
      });
      const res1 = request('POST', SERVER_URL + '/v1/admin/quiz',
        {
          json: {
            token: token.token,
            name: 'Betty boop quiz',
            description: 'Quiz for Betty boop'
          },
          timeout: TIMEOUT_MS
        });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);
    });

    test('description is more than 100 characters in length', () => {
      const res1 = request('POST', SERVER_URL + '/v1/admin/quiz',
        {
          json: {
            token: token.token,
            name: 'Betty boop quiz',
            description: `Quiz for Betty boop ${'a'.repeat(101)}`
          },
          timeout: TIMEOUT_MS
        });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);
    });

    test('Correctly created a quiz', () => {
      const res1 = request('POST', SERVER_URL + '/v1/admin/quiz',
        {
          json: {
            token: token.token,
            name: 'Betty boop quiz',
            description: 'Quiz for Betty boop'
          },
          timeout: TIMEOUT_MS
        });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(
        {
          quizId: expect.any(Number),
        }
      );
    });

    test('Correctly created a quiz with empty description', () => {
      const res1 = request('POST', SERVER_URL + '/v1/admin/quiz',
        {
          json: {
            token: token.token,
            name: 'Betty boop quiz',
            description: ''
          },
          timeout: TIMEOUT_MS
        });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(
        {
          quizId: expect.any(Number),
        }
      );
    });
  });
});
