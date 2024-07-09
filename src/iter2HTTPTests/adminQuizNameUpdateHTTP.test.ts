import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('PUT /v1/admin/quiz/:quizid/name', () => {
    let token: { token: string };
    let quiz: { quizId: number };
    beforeEach(() => {
      const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'betty@unsw.com', password: 'password1', nameFirst: 'Betty', nameLast: 'Boop' }, timeout: TIMEOUT_MS });
      token = JSON.parse(resUser.body.toString());
      const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'Quiz1', description: 'Betty\'s quiz'}, timeout: TIMEOUT_MS });
      quiz = JSON.parse(resQuiz.body.toString());
    });
    
    describe('functionality testing', () => {
        test('has the correct return type', () => {
            const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/name`, { json: { token: token.token, name: 'New quiz1' }, timeout: TIMEOUT_MS });
            expect(JSON.parse(res.body.toString())).toStrictEqual({});
        });
    });
});
  