import request from 'sync-request-curl';
import { port, url } from '../config.json';

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', {
    timeout: TIMEOUT_MS
  });
});

describe('DELETE /v1/admin/quiz/:quizid/question/:questionid', () => {
  let token: {
    token: string
  };
  let quizId: number;
  let question: {
    questionId: number
  };
  beforeEach(() => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'originalemail@gmail.com',
        password: '1234zyx#@',
        nameFirst: 'Betty',
        nameLast: 'Boop'
      },
      timeout: TIMEOUT_MS
    });
    token = JSON.parse(resUser.body.toString());

    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token.token,
        name: 'Sample Quiz',
        description: 'For testing purposes quiz'
      },
      timeout: TIMEOUT_MS
    });
    const quiz = JSON.parse(resQuiz.body.toString());
    quizId = quiz.quizId;

    const resQues = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/`, {
      json: {
        token: token.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{
            answer: 'Prince Charles',
            correct: true
          },
          {
            answer: 'Queen Elizabeth',
            correct: false
          }
          ]
        }
      },
      timeout: TIMEOUT_MS
    });
    question = JSON.parse(resQues.body.toString());
  });

  describe('functionality testing', () => {
    test('Successfully deletes the question', () => {
      const res = request('DELETE',
      `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${question.questionId}`, {
        qs: {
          token: token.token
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res.body.toString())).toStrictEqual({});

      const res2 = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizId}`, {
        qs: token,
        timeout: TIMEOUT_MS
      });
      const updatedQuiz = JSON.parse(res2.body.toString());
      expect(updatedQuiz.questions).toHaveLength(0);
    });
  });

  describe('Error Testing', () => {
    test('Case when token is invalid', () => {
      const res = request('DELETE',
      `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${question.questionId}`, {
        qs: {
          token: token.token + 1
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Case when quiz is not found from quizid', () => {
      const res = request('DELETE',
      `${SERVER_URL}/v1/admin/quiz/${quizId + 1}/question/${question.questionId}`, {
        qs: {
          token: token.token
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('Case when question ID does not refer to a valid question within this quiz', () => {
      const res = request('DELETE',
      `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${question.questionId + 1}`, {
        qs: {
          token: token.token
        },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when user is not the owner of the quiz', () => {
      const resN = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'secondemail@gmail.com',
          password: '1234zyx#@',
          nameFirst: 'Naruto',
          nameLast: 'Uzumaki'
        },
        timeout: TIMEOUT_MS
      });
      const token2 = JSON.parse(resN.body.toString());

      const res = request('DELETE',
      `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${question.questionId}`, {
        qs: {
          token: token2.token
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });
});
