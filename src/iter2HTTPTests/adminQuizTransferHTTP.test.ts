import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
const INPUT_USER_1 = { email: 'betty@unsw.com', password: 'password1', nameFirst: 'Betty', nameLast: 'Boop' };
const INPUT_USER_2 = { email: 'norman@unsw.com', password: 'password1', nameFirst: 'Norman', nameLast: 'Nile'};

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  });
  

describe('POST /v1/admin/quiz/:quizid/transfer', () => {
    let token: { token: string };
    let token2: { token: string };
    let quiz: { quizId: number };
    beforeEach(() => {
      const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: INPUT_USER_1, timeout: TIMEOUT_MS });
      token = JSON.parse(resUser.body.toString());
      const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'Quiz1', description: 'Betty\'s quiz'}, timeout: TIMEOUT_MS });
      quiz = JSON.parse(resQuiz.body.toString());

      const resUser2 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: INPUT_USER_2, timeout: TIMEOUT_MS });
      token2 = JSON.parse(resUser2.body.toString());
    });
  
    describe('functionality testing', () => {
        test('has the correct return type', () => {
            const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/transfer`, { json: { token: token.token, userEmail: INPUT_USER_2.email }, timeout: TIMEOUT_MS });
            expect(JSON.parse(res.body.toString())).toStrictEqual({});
        });
    });
});