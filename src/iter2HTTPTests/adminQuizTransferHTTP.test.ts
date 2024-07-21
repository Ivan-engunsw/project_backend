import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
const INPUT_USER_1 = {
  email: 'betty@unsw.com',
  password: 'password1',
  nameFirst: 'Betty',
  nameLast: 'Boop'
};
const INPUT_USER_2 = {
  email: 'norman@unsw.com',
  password: 'password1',
  nameFirst: 'Norman',
  nameLast: 'Nile'
};
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', {
    timeout: TIMEOUT_MS
  });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', {
    timeout: TIMEOUT_MS
  });
});

describe('POST /v1/admin/quiz/:quizid/transfer', () => {
  let token: {
    token: string
  };
  let token2: {
    token: string
  };
  let quiz: {
    quizId: number
  };
  beforeEach(() => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: INPUT_USER_1,
      timeout: TIMEOUT_MS
    });
    token = JSON.parse(resUser.body.toString());
    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token.token,
        name: 'Quiz1',
        description: 'Betty\'s quiz'
      },
      timeout: TIMEOUT_MS
    });
    quiz = JSON.parse(resQuiz.body.toString());

    const resUser2 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: INPUT_USER_2,
      timeout: TIMEOUT_MS
    });
    token2 = JSON.parse(resUser2.body.toString());
  });

  describe('error testing', () => {
    test('returns an error for an invalid target email', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/transfer`, {
        json: {
          token: token.token,
          userEmail: 'notanemail@unsw.com'
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for the current user\'s email', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/transfer`, {
        json: {
          token: token.token,
          userEmail: INPUT_USER_1.email
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for a quiz name already in use by the target', () => {
      request('POST', SERVER_URL + '/v1/admin/quiz', {
        json: {
          token: token2.token,
          name: 'Quiz1',
          description: 'Norman\'s quiz'
        },
        timeout: TIMEOUT_MS
      });
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/transfer`, {
        json: {
          token: token.token,
          userEmail: INPUT_USER_2.email
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for a quiz not owned by this user', () => {
      const resQuiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', {
        json: {
          token: token2.token,
          name: 'Quiz1',
          description: 'Norman\'s quiz'
        },
        timeout: TIMEOUT_MS
      });
      const quiz2 = JSON.parse(resQuiz2.body.toString());
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}/transfer`, {
        json: {
          token: token.token,
          userEmail: INPUT_USER_2.email
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('returns an error for an invalid authUserId', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/transfer`, {
        json: {
          token: token.token + 1,
          userEmail: INPUT_USER_2.email
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('returns an error for an invalid quizId', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId + 1}/transfer`, {
        json: {
          token: token.token,
          userEmail: INPUT_USER_2.email
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/transfer`, {
        json: {
          token: token.token,
          userEmail: INPUT_USER_2.email
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('quiz is successfully transferred to target', () => {
      request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/transfer`, {
        json: {
          token: token.token,
          userEmail: INPUT_USER_2.email
        },
        timeout: TIMEOUT_MS
      });
      const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, {
        qs: {
          token: token2.token
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        quizId: quiz.quizId,
        name: 'Quiz1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Betty\'s quiz',
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number)
      });
    });
  });
});
