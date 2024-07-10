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

//let userToken: { json: { token: string }, timeout: number };
const quizIds:  number[] = [];
let token: { token: string };
let quizId: { quizId: number };

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', createUser);
  token = JSON.parse(resUser.body.toString());

  const createQuiz = {
    json: {
      token: token.token,
      name: 'Bobby Bob quiz',
      description: 'Quiz for Bobby Bob'
    },
    timeout: TIMEOUT_MS
  };

  const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', createQuiz);
  quizId = JSON.parse(resQuiz.body.toString());
  quizIds.push(quizId.quizId);
});

describe('DELETE /v1/admin/quiz/trash/empty', () => {
  describe('Error Testing', () => {
    test('One of users quiz is not currently in the trash', () => {
      const res = request('DELETE', SERVER_URL + '/v1/admin/quiz/trash/empty', { qs: { token: token.token, quizIds: [quizId.quizId] }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('All but one quiz is in the trash', () => {
      const resQuiz1 = request('POST', SERVER_URL + '/v1/admin/quiz', 
        { json: { token: token.token, name: 'New Quiz One', description: 'Quiz getting deleted' }, timeout: TIMEOUT_MS});
      const resQuiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', 
        { json: { token: token.token, name: 'New Quiz Two', description: 'Quiz getting deleted' }, timeout: TIMEOUT_MS});

      const quizId1 = JSON.parse(resQuiz1.body.toString());
      const quizId2 = JSON.parse(resQuiz2.body.toString());
      quizIds.push(quizId1.quizId);
      quizIds.push(quizId2.quizId);

      request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId1.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });
      request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId2.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });
      
      const res = request('DELETE', SERVER_URL + '/v1/admin/quiz/trash/empty', { qs: { token: token.token, quizIds: JSON.stringify(quizIds) }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });
  });

  describe('Functionality testing', () => {
    test('Has the correct return type', () => {
      request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });

      const res = request('DELETE', SERVER_URL + '/v1/admin/quiz/trash/empty', { qs: { token: token.token, quizIds: JSON.stringify(quizIds) }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual( {} );
    });
  });
});
