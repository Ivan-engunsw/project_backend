import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { timeNow } from '../helper';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('POST /v1/admin/quiz/:quizid/description', () => {
  let token: { token: string };
  let quiz: { quizId: number };
  beforeEach(() => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'betty@unsw.com', password: 'password1', nameFirst: 'Betty', nameLast: 'Boop' }, timeout: TIMEOUT_MS });
    token = JSON.parse(resUser.body.toString());
    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'Quiz1', description: 'Betty\'s quiz' }, timeout: TIMEOUT_MS });
    quiz = JSON.parse(resQuiz.body.toString());
  });

  describe('error testing', () => {
    test('returns an error for a description that is too long', () => {
      const veryLongString = '10charlong :)'.repeat(10);
      const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/description`, { json: { token: token.token, description: veryLongString }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for invalid token', () => {
      const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/description`, { json: { token: token.token + 1, description: 'Norman\'s quiz' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('returns an error for invalid quizId', () => {
      const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId + 1}/description`, { json: { token: token.token, description: 'Norman\'s quiz' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('returns an error for a quiz not owned by this user', () => {
      const resUser2 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'norman@unsw.com', password: 'password1', nameFirst: 'Norman', nameLast: 'Nile' }, timeout: TIMEOUT_MS });
      const token2 = JSON.parse(resUser2.body.toString());
      const resQuiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token2.token, name: 'Quiz2', description: 'Norman\'s quiz' }, timeout: TIMEOUT_MS });
      const quiz2 = JSON.parse(resQuiz2.body.toString());
      const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}/description`, { json: { token: token.token, description: 'Norman\'s quiz' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/description`, { json: { token: token.token, description: 'Norman\'s quiz' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('correctly returns for an empty string', () => {
      const emptyString = '';
      const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/description`, { json: { token: token.token, description: emptyString }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('successfully updates the description of a quiz and the timeLastEdited', () => {
      request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/description`, { json: { token: token.token, description: 'Norman\'s quiz' }, timeout: TIMEOUT_MS });
      const time = timeNow();
      const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(
        {
          quizId: quiz.quizId,
          name: 'Quiz1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Norman\'s quiz',
          numQuestions: expect.any(Number),
          questions: [],
          duration: expect.any(Number)
        }
      );

      const timeLastEdited = parseInt(JSON.parse(res.body.toString()).timeLastEdited);
      expect(timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(timeLastEdited).toBeLessThanOrEqual(time + 1);
    });

    test('successfully updates the dscription of multiple quizzes', () => {
      const resQuiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'Quiz2', description: 'Norman\'s quiz' }, timeout: TIMEOUT_MS });
      const quiz2 = JSON.parse(resQuiz2.body.toString());
      request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/description`, { json: { token: token.token, description: 'New description1' }, timeout: TIMEOUT_MS });
      request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}/description`, { json: { token: token.token, description: 'New description2' }, timeout: TIMEOUT_MS });
      const res1 = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(
        {
          quizId: quiz.quizId,
          name: 'Quiz1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'New description1',
          numQuestions: expect.any(Number),
          questions: [],
          duration: expect.any(Number)
        }
      );

      const res2 = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(
        {
          quizId: quiz2.quizId,
          name: 'Quiz2',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'New description2',
          numQuestions: expect.any(Number),
          questions: [],
          duration: expect.any(Number)
        }
      );
    });
  });
});
