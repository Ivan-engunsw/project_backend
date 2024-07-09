import request from 'sync-request-curl';
import config from '../config.json';

const SERVER_URL = `${config.url}:${config.port}`;
const TIMEOUT_MS = 5 * 1000;
const ERROR = { error: expect.any(String) };

describe('adminQuizRemove', () => {
  beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  });

  test('AuthUserId is not a valid user', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
    const token = JSON.parse(resUser.body.toString());

    const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token: token.token + 1 }, timeout: TIMEOUT_MS });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Successfully view one deleted quiz', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
    const token = JSON.parse(resUser.body.toString());

    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'first', description: 'desc' }, timeout: TIMEOUT_MS });
    const quiz = JSON.parse(resQuiz.body.toString());

    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });
    
    const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token: token.token + 1 }, timeout: TIMEOUT_MS });
    expect(JSON.parse(res.body.toString())).toStrictEqual([quiz]);
  });

  test('Successfully view multiple deleted quizzes', () => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'auth@one.com', password: 'authone1', nameFirst: 'auth', nameLast: 'one' }, timeout: TIMEOUT_MS });
    const token = JSON.parse(resUser.body.toString());

    const resQuiz1 = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'first', description: 'desc' }, timeout: TIMEOUT_MS });
    const quiz1 = JSON.parse(resQuiz1.body.toString());

    request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'second', description: 'desc' }, timeout: TIMEOUT_MS });

    const resQuiz3 = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'third', description: 'desc' }, timeout: TIMEOUT_MS });
    const quiz3 = JSON.parse(resQuiz3.body.toString());

    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });
    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz3.quizId}`, { qs: { token: token.token }, timeout: TIMEOUT_MS });
    
    const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token: token.token + 1 }, timeout: TIMEOUT_MS });
    expect(JSON.parse(res.body.toString())).toStrictEqual([quiz1, quiz3]);
  });
});