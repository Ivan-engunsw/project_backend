// The test for the other.js program which only contains the clear function

import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
const ERROR = { error: expect.any(String) };
const INPUT_USER = {
  email: 'betty@unsw.com',
  password: 'password1',
  nameFirst: 'Betty',
  nameLast: 'Boop',
};

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/v1/clear',
    { timeout: TIMEOUT_MS }
  );
});

describe('DELETE /v1/clear', () => {
  test('has the correct return type', () => {
    const res = request(
      'DELETE',
      SERVER_URL + '/v1/clear',
      { timeout: TIMEOUT_MS }
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
  });

  test('cannot get user details or quiz info', () => {
    const resUser = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      { json: INPUT_USER, timeout: TIMEOUT_MS }
    );
    const token = JSON.parse(resUser.body.toString()).token;

    const inputQuiz = {
      token: token,
      name: 'My quiz',
      description: 'Bye'
    };
    const resQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      { json: inputQuiz, timeout: TIMEOUT_MS }
    );
    const quizId = JSON.parse(resQuiz.body.toString()).quizId;

    request(
      'DELETE',
      SERVER_URL + '/v1/clear',
      { timeout: TIMEOUT_MS }
    );

    const res1 = request(
      'GET',
      SERVER_URL + '/v1/admin/user/details',
      { qs: { token: token }, timeout: TIMEOUT_MS }
    );
    expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);

    const res2 = request(
      'GET',
      SERVER_URL + `/v1/admin/quiz/${quizId}`,
      { qs: { token: token }, timeout: TIMEOUT_MS }
    );
    expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
  });

  test('cannot login', () => {
    request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      { json: INPUT_USER, timeout: TIMEOUT_MS }
    );

    request(
      'DELETE',
      SERVER_URL + '/v1/clear',
      { timeout: TIMEOUT_MS }
    );

    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/login',
      { json: { email: INPUT_USER.email, password: INPUT_USER.password }, timeout: TIMEOUT_MS }
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
  });
});
