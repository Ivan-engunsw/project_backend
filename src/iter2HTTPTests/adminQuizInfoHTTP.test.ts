import request from 'sync-request-curl';
import config from '../config.json';

const SERVER_URL = `${config.url}:${config.port}`
const TIMEOUT_MS = 5 * 1000;
const ERROR = { error: expect.any(String) };

import { adminQuizCreate, adminQuizInfo } from '../quiz';
import { adminAuthRegister } from '../auth';

describe('GET /v1/admin/quiz/:quizid', () => {
  describe('adminQuizInfo HTTP tests', () => {
    beforeEach(() => {
      request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
    });

    test('AuthUserId is not a valid user', () => {
      const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
      const token = JSON.parse(resUser.body.toString());

      const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'first', description: 'desc'}, timeout: TIMEOUT_MS });
      const quiz = JSON.parse(resQuiz.body.toString());

      const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: { token: token.token + 1 }, timeout: TIMEOUT_MS});
		  expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Quiz ID does not refer to a valid quiz', () => {
      const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
      const token = JSON.parse(resUser.body.toString());

      const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'first', description: 'desc'}, timeout: TIMEOUT_MS });
      const quiz = JSON.parse(resQuiz.body.toString());

      const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz.quizId + 1}`, { qs: { token: token.token }, timeout: TIMEOUT_MS});
		  expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('Quiz ID does not refer to a quiz that this user owns', () => {
      const resUser1 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
      const token1 = JSON.parse(resUser1.body.toString());

      const resUser2 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@two.com', password: 'authtwo2', nameFirst: 'auth', nameLast: 'two' }, timeout: TIMEOUT_MS });
      const token2 = JSON.parse(resUser2.body.toString());

      const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token1.token, name: 'first', description: 'desc'}, timeout: TIMEOUT_MS });
      const quiz = JSON.parse(resQuiz.body.toString());

      const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: { token: token2.token }, timeout: TIMEOUT_MS});
		  expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('Successfully view one quiz', () => {
      const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
      const token = JSON.parse(resUser.body.toString());

      const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'first', description: 'desc'}, timeout: TIMEOUT_MS });
      const quiz = JSON.parse(resQuiz.body.toString());

      const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS});
		  expect(JSON.parse(res.body.toString())).toStrictEqual({
        quizId: expect.any(Number),
        name: 'first',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'desc'
      });
    });

    test('Successfully view multiple quizzes', () => {
      const resUser1 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
      const token1 = JSON.parse(resUser1.body.toString());

      const resUser2 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@two.com', password: 'authtwo2', nameFirst: 'auth', nameLast: 'two' }, timeout: TIMEOUT_MS });
      const token2 = JSON.parse(resUser2.body.toString());

      const resQuiz1 = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token1.token, name: 'first', description: 'desc'}, timeout: TIMEOUT_MS });
      const quiz1 = JSON.parse(resQuiz1.body.toString());

      const resQuiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token1.token, name: 'second', description: 'desc'}, timeout: TIMEOUT_MS });
      const quiz2 = JSON.parse(resQuiz2.body.toString());

      const resQuiz3 = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token2.token, name: 'third', description: 'desc'}, timeout: TIMEOUT_MS });
      const quiz3 = JSON.parse(resQuiz3.body.toString());

      const res1 = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, { qs: { token: token1.token }, timeout: TIMEOUT_MS});
		  expect(JSON.parse(res1.body.toString())).toStrictEqual({
        quizId: expect.any(Number),
        name: 'first',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'desc'
      });

      const res2 = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}`, { qs: { token: token1.token }, timeout: TIMEOUT_MS});
		  expect(JSON.parse(res2.body.toString())).toStrictEqual({
        quizId: expect.any(Number),
        name: 'second',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'desc'
      });

      const res3 = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz3.quizId}`, { qs: { token: token2.token }, timeout: TIMEOUT_MS});
		  expect(JSON.parse(res3.body.toString())).toStrictEqual({
        quizId: expect.any(Number),
        name: 'second',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'desc'
      });
    });
  });
});
