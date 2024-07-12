import request from 'sync-request-curl';
import config from '../config.json';

const SERVER_URL = `${config.url}:${config.port}`;
const TIMEOUT_MS = 5 * 1000;
const ERROR = { error: expect.any(String) };

describe('adminQuizRemove', () => {
  beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', {
      timeout: TIMEOUT_MS
    });
  });

  test('AuthUserId is not a valid user', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'auth@one.com',
        password: 'authone1',
        nameFirst: 'auth',
        nameLast: 'one'
      },
      timeout: TIMEOUT_MS
    });
    const token = JSON.parse(resUser.body.toString());

    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token.token,
        name: 'first',
        description: 'desc'
      },
      timeout: TIMEOUT_MS
    });
    const quiz = JSON.parse(resQuiz.body.toString());

    const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, {
      qs: {
        token: token.token + 1
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'auth@one.com',
        password: 'authone1',
        nameFirst: 'auth',
        nameLast: 'one'
      },
      timeout: TIMEOUT_MS
    });
    const token = JSON.parse(resUser.body.toString());

    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token.token,
        name: 'first',
        description: 'desc'
      },
      timeout: TIMEOUT_MS
    });
    const quiz = JSON.parse(resQuiz.body.toString());

    const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz.quizId + 1}`, {
      qs: {
        token: token.token
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const resUser1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'auth@one.com',
        password: 'authone1',
        nameFirst: 'auth',
        nameLast: 'one'
      },
      timeout: TIMEOUT_MS
    });
    const token1 = JSON.parse(resUser1.body.toString());

    const resUser2 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'auth@two.com',
        password: 'authtwo2',
        nameFirst: 'auth',
        nameLast: 'two'
      },
      timeout: TIMEOUT_MS
    });
    const token2 = JSON.parse(resUser2.body.toString());

    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token1.token,
        name: 'first',
        description: 'desc'
      },
      timeout: TIMEOUT_MS
    });
    const quiz = JSON.parse(resQuiz.body.toString());

    const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, {
      qs: {
        token: token2.token
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Correct return type', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'auth@one.com',
        password: 'authone1',
        nameFirst: 'auth',
        nameLast: 'one'
      },
      timeout: TIMEOUT_MS
    });
    const token = JSON.parse(resUser.body.toString());

    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token.token,
        name: 'first',
        description: 'desc'
      },
      timeout: TIMEOUT_MS
    });
    const quiz = JSON.parse(resQuiz.body.toString());

    const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, {
      qs: {
        token: token.token
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
  });

  test('Successfully delete one quiz', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'auth@one.com',
        password: 'authone1',
        nameFirst: 'auth',
        nameLast: 'one'
      },
      timeout: TIMEOUT_MS
    });
    const token = JSON.parse(resUser.body.toString());

    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token.token,
        name: 'first',
        description: 'desc'
      },
      timeout: TIMEOUT_MS
    });
    const quiz = JSON.parse(resQuiz.body.toString());

    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, {
      qs: {
        token: token.token
      },
      timeout: TIMEOUT_MS
    });

    const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token.token,
        name: 'first',
        description: 'desc'
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      quizId: expect.any(Number)
    });

    const trash = request('GET', SERVER_URL + '/v1/admin/quiz/trash', {
      qs: {
        token: token.token
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(trash.body.toString())).toStrictEqual({
      quizzes: [{
        name: 'first',
        quizId: quiz.quizId
      }]
    });
  });

  test('Successfully delete multiple quizzes', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'auth@one.com',
        password: 'authone1',
        nameFirst: 'auth',
        nameLast: 'one'
      },
      timeout: TIMEOUT_MS
    });
    const token = JSON.parse(resUser.body.toString());

    const resQuiz1 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token.token,
        name: 'first',
        description: 'desc'
      },
      timeout: TIMEOUT_MS
    });
    const quiz1 = JSON.parse(resQuiz1.body.toString());

    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, {
      qs: {
        token: token.token
      },
      timeout: TIMEOUT_MS
    });

    const res1 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token.token,
        name: 'first',
        description: 'desc'
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res1.body.toString())).toStrictEqual({
      quizId: expect.any(Number)
    });

    const resQuiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token.token,
        name: 'second',
        description: 'desc'
      },
      timeout: TIMEOUT_MS
    });
    const quiz2 = JSON.parse(resQuiz2.body.toString());

    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}`, {
      qs: {
        token: token.token
      },
      timeout: TIMEOUT_MS
    });

    const res2 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token.token,
        name: 'second',
        description: 'desc'
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res2.body.toString())).toStrictEqual({
      quizId: expect.any(Number)
    });

    const trash = request('GET', SERVER_URL + '/v1/admin/quiz/trash', {
      qs: {
        token: token.token
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(trash.body.toString())).toStrictEqual({
      quizzes: [{
        name: 'first',
        quizId: quiz1.quizId
      }, {
        name: 'second',
        quizId: quiz2.quizId
      }]
    });
  });
});
