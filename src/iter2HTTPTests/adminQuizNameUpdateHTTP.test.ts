import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { timeNow } from '../helper';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('PUT /v1/admin/quiz/:quizid/name', () => {
  let token: { token: string };
  let quiz: { quizId: number };
  beforeEach(() => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'betty@unsw.com', password: 'password1', nameFirst: 'Betty', nameLast: 'Boop' }, timeout: TIMEOUT_MS });
    token = JSON.parse(resUser.body.toString());
    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'Quiz1', description: 'Betty\'s quiz' }, timeout: TIMEOUT_MS });
    quiz = JSON.parse(resQuiz.body.toString());
  });

  describe('error testing', () => {
    test.each([
      { name: '' },
      { name: '12' },
      { name: 'ab' },
      { name: 'abcdefghijklmnopqrstuvwxyz123456' },
      { name: '@!#$&#)$)*#$*__!@(**@' },
    ])('returns an error for invalid names', ({ name }) => {
      const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/name`, { json: { token: token.token, name: name }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for name already in use', () => {
      request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'Quiz2', description: 'Norman\'s quiz' }, timeout: TIMEOUT_MS });
      const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/name`, { json: { token: token.token, name: 'Quiz2' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for invalid token', () => {
      const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/name`, { json: { token: token.token + 1, name: 'Quiz2' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('returns an error for invalid quizId', () => {
      const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId + 1}/name`, { json: { token: token.token, name: 'Quiz2' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('returns an error for a quiz not owned by this user', () => {
      const resUser2 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'norman@unsw.com', password: 'password1', nameFirst: 'Norman', nameLast: 'Nile' }, timeout: TIMEOUT_MS });
      const token2 = JSON.parse(resUser2.body.toString());
      const resQuiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token2.token, name: 'Quiz2', description: 'Norman\'s quiz' }, timeout: TIMEOUT_MS });
      const quiz2 = JSON.parse(resQuiz2.body.toString());
      const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}/name`, { json: { token: token.token, name: 'Quiz2' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/name`, { json: { token: token.token, name: 'New quiz1' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('successfully updates the name of a quiz and timeLastEdited', () => {
      request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/name`, { json: { token: token.token, name: 'New quiz1' }, timeout: TIMEOUT_MS });
      const time = timeNow();
      const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(
        {
          quizId: quiz.quizId,
          name: 'New quiz1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Betty\'s quiz',
        }
      );

      const timeLastEdited = parseInt(JSON.parse(res.body.toString()).timeLastEdited);
      expect(timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(timeLastEdited).toBeLessThanOrEqual(time + 1);
    });

    test('successfully updates the name of multiple quizzes', () => {
      const resQuiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'Quiz2', description: 'Norman\'s quiz'}, timeout: TIMEOUT_MS });
      const quiz2 = JSON.parse(resQuiz2.body.toString());
      request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/name`, { json: { token: token.token, name: 'New quiz1' }, timeout: TIMEOUT_MS });
      request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}/name`, { json: { token: token.token, name: 'New quiz2' }, timeout: TIMEOUT_MS });
      const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token: token.token }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'New quiz1',
          },
          {
            quizId: quiz2.quizId,
            name: 'New quiz2',
          },
        ]
      });
    });
  });
});
