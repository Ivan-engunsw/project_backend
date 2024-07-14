import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { Quiz } from '../dataStore';

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', {
    timeout: TIMEOUT_MS
  });
});

describe('GET /v1/admin/quiz/list', () => {
  test('Token is non-existent', () => {
    const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', {
      qs: {
        token: '0'
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  describe('After creating tokens', () => {
    let token: {
      token: string
    };
    beforeEach(() => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
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

    test('Token is not a valid user', () => {
      const res1 = request('GET', SERVER_URL + '/v1/admin/quiz/list', {
        qs: {
          token: token.token + '1'
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(401);
    });

    test('Returning the correct details', () => {
      const res1 = request('GET', SERVER_URL + '/v1/admin/quiz/list', {
        qs: {
          token: token.token
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res1.body.toString())).toStrictEqual({
        quizzes: []
      });
    });

    describe('After creating quizzes', () => {
      let quiz1: {
        quizId: number
      };
      let quizDetails1: Quiz;
      beforeEach(() => {
        const res1 = request('POST', SERVER_URL + '/v1/admin/quiz', {
          json: {
            token: token.token,
            name: 'quiz 1',
            description: 'Mathematics Quiz'
          },
          timeout: TIMEOUT_MS
        });
        quiz1 = JSON.parse(res1.body.toString());
        const res2 = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, {
          qs: {
            token: token.token
          },
          timeout: TIMEOUT_MS
        });
        quizDetails1 = JSON.parse(res2.body.toString());
      });
      test('Returning the correct details when one quiz is created', () => {
        const res3 = request('GET', SERVER_URL + '/v1/admin/quiz/list', {
          qs: {
            token: token.token
          },
          timeout: TIMEOUT_MS
        });
        expect(JSON.parse(res3.body.toString())).toStrictEqual({
          quizzes: [{
            quizId: quiz1.quizId,
            name: quizDetails1.name,
          }]
        });
      });

      test('Returning the correct details when multiple quizzes is created', () => {
        const res3 = request('POST', SERVER_URL + '/v1/admin/quiz', {
          json: {
            token: token.token,
            name: 'quiz 2',
            description: 'English Quiz'
          },
          timeout: TIMEOUT_MS
        });
        const quiz2 = JSON.parse(res3.body.toString());
        const res4 = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}`, {
          qs: {
            token: token.token
          },
          timeout: TIMEOUT_MS
        });
        const quizDetails2 = JSON.parse(res4.body.toString());
        const res5 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
          json: {
            email: 'ronaldoSuiii@gmail.com',
            password: 'helloWorld5',
            nameFirst: 'Ronaldo',
            nameLast: 'Suiii'
          },
          timeout: TIMEOUT_MS
        });
        const token2 = JSON.parse(res5.body.toString());
        request('POST', SERVER_URL + '/v1/admin/quiz', {
          json: {
            token: token2.token,
            name: 'quiz 1',
            description: 'English Quiz'
          },
          timeout: TIMEOUT_MS
        });
        const list1 = new Set();
        list1.add({
          quizId: quiz1.quizId,
          name: quizDetails1.name,
        });
        list1.add({
          quizId: quiz2.quizId,
          name: quizDetails2.name,
        });

        const list2 = new Set();
        const res6 = request('GET', SERVER_URL + '/v1/admin/quiz/list', {
          qs: {
            token: token.token
          },
          timeout: TIMEOUT_MS
        });
        const quizListVariable = JSON.parse(res6.body.toString()).quizzes;
        for (const quizzes of quizListVariable) {
          list2.add(quizzes);
        }
        expect(list2).toStrictEqual(list1);
      });
    });
  });
});
