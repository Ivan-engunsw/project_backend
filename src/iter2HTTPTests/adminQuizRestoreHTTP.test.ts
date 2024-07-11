import request from 'sync-request-curl';
import config from '../config.json';

const SERVER_URL = `${config.url}:${config.port}`;
const TIMEOUT_MS = 5 * 1000;
const ERROR = { error: expect.any(String) };

describe('adminQuizRestore', () => {
  beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  });

  // !!! cannot correctly test case below due to quiz trash implementation !!!
  /*
  test('Quiz ID refers to a quiz that is not currently in the trash', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
    const token = JSON.parse(resUser.body.toString());

    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'first', description: 'desc' }, timeout: TIMEOUT_MS });
    const quiz = JSON.parse(resQuiz.body.toString());

    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/restore`, { json: { token: token.token }, timeout: TIMEOUT_MS });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });
  */

  test('Quiz name of the restored quiz is already used by another active quiz', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
    const token = JSON.parse(resUser.body.toString());

    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'first', description: 'desc' }, timeout: TIMEOUT_MS });
    const quiz = JSON.parse(resQuiz.body.toString());

    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });
    request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'first', description: 'desc' }, timeout: TIMEOUT_MS });

    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/restore`, { json: { token: token.token }, timeout: TIMEOUT_MS });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('AuthUserId is not a valid user', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
    const token = JSON.parse(resUser.body.toString());

    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'first', description: 'desc' }, timeout: TIMEOUT_MS });
    const quiz = JSON.parse(resQuiz.body.toString());

    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/restore`, { json: { token: token.token + 1 }, timeout: TIMEOUT_MS });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
    const token = JSON.parse(resUser.body.toString());

    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'first', description: 'desc' }, timeout: TIMEOUT_MS });
    const quiz = JSON.parse(resQuiz.body.toString());

    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId + 1}/restore`, { json: { token: token.token }, timeout: TIMEOUT_MS });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const resUser1 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
    const token1 = JSON.parse(resUser1.body.toString());

    const resUser2 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@two.com', password: 'authtwo2', nameFirst: 'auth', nameLast: 'two' }, timeout: TIMEOUT_MS });
    const token2 = JSON.parse(resUser2.body.toString());

    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token1.token, name: 'first', description: 'desc' }, timeout: TIMEOUT_MS });
    const quiz = JSON.parse(resQuiz.body.toString());

    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: { token: token1.token }, timeout: TIMEOUT_MS });

    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/restore`, { json: { token: token2.token }, timeout: TIMEOUT_MS });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Correct return type', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
    const token = JSON.parse(resUser.body.toString());

    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'first', description: 'desc' }, timeout: TIMEOUT_MS });
    const quiz = JSON.parse(resQuiz.body.toString());

    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });

    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/restore`, { json: { token: token.token }, timeout: TIMEOUT_MS });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
  });

  test('Successfully restore one quiz', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
    const token = JSON.parse(resUser.body.toString());

    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'first', description: 'desc' }, timeout: TIMEOUT_MS });
    const quiz = JSON.parse(resQuiz.body.toString());

    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });

    const infoBef = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token: token.token }, timeout: TIMEOUT_MS });
    expect(JSON.parse(infoBef.body.toString()).quizzes).toStrictEqual([]);
    const trashBef = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token: token.token }, timeout: TIMEOUT_MS });
    expect(JSON.parse(trashBef.body.toString()).quizzes).toStrictEqual([{ quizId: quiz.quizId, name: 'first' }]);

    request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/restore`, { json: { token: token.token }, timeout: TIMEOUT_MS });

    const infoAft = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token: token.token }, timeout: TIMEOUT_MS });
    expect(JSON.parse(infoAft.body.toString()).quizzes).toStrictEqual([{ quizId: quiz.quizId, name: 'first' }]);
    const trashAft = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token: token.token }, timeout: TIMEOUT_MS });
    expect(JSON.parse(trashAft.body.toString()).quizzes).toStrictEqual([]);
  });

  test('Successfully restore multiple quizzes', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
    const token = JSON.parse(resUser.body.toString());

    const resQuiz1 = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'first', description: 'desc' }, timeout: TIMEOUT_MS });
    const quiz1 = JSON.parse(resQuiz1.body.toString());

    const resQuiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'second', description: 'desc' }, timeout: TIMEOUT_MS });
    const quiz2 = JSON.parse(resQuiz2.body.toString());

    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });
    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });

    const infoBef = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token: token.token }, timeout: TIMEOUT_MS });
    expect(JSON.parse(infoBef.body.toString()).quizzes).toStrictEqual([]);
    const trashBef = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token: token.token }, timeout: TIMEOUT_MS });
    expect(JSON.parse(trashBef.body.toString()).quizzes).toStrictEqual([{ quizId: quiz1.quizId, name: 'first' }, { quizId: quiz2.quizId, name: 'second' }]);

    request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/restore`, { json: { token: token.token }, timeout: TIMEOUT_MS });
    request('POST', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}/restore`, { json: { token: token.token }, timeout: TIMEOUT_MS });

    const infoAft = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token: token.token }, timeout: TIMEOUT_MS });
    expect(JSON.parse(infoAft.body.toString()).quizzes).toStrictEqual([{ quizId: quiz1.quizId, name: 'first' }, { quizId: quiz2.quizId, name: 'second' }]);
    const trashAft = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token: token.token }, timeout: TIMEOUT_MS });
    expect(JSON.parse(trashAft.body.toString()).quizzes).toStrictEqual([]);
  });
});
