import request from 'sync-request-curl';
import { port, url } from '../config.json';

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('DELETE /v1/admin/quiz/:quizid/question/:questionid', () => {
  let token: { token: string };
  let quiz: {quizId: number};
  let quizId: number;

  beforeEach(() => {
    // Register and create a quiz with a question
    const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'originalemail@gmail.com',
        password: '1234zyx#@',
        nameFirst: 'Betty',
        nameLast: 'Boop'
      },
      timeout: TIMEOUT_MS
    });
    token = JSON.parse(res1.body.toString());

    const res2 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token.token,
        name: 'Sample Quiz',
        duration: 180,
        questions: [{
          question: 'Initial Question?',
          duration: 30,
          points: 5,
          answers: [
            { answer: 'Answer 1', correct: false },
            { answer: 'Answer 2', correct: true }
          ]
        }]
      },
      timeout: TIMEOUT_MS
    });

    quiz = JSON.parse(res2.body.toString());
    quizId = quiz.quizId;
  });

  test('Successfully deletes the question', () => {
    const resQ = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/`, {
      json: {
        token: token.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            { answer: 'Prince Charles', correct: true },
            { answer: 'Queen Elizabeth', correct: false }
          ]
        }
      },
      timeout: TIMEOUT_MS
    });
    const questionId = JSON.parse(resQ.body.toString());

    const res3 = request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId.questionId}`, {
      qs: { token: token.token },
      timeout: TIMEOUT_MS
    });

    expect(res3.statusCode).toStrictEqual(200);

    // Verify deletion
    const res4 = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizId}`, {
      qs: token,
      timeout: TIMEOUT_MS
    });

    const updatedQuiz = JSON.parse(res4.body.toString());
    expect(updatedQuiz.questions).toHaveLength(0);
  });

  // Error tests
  describe('Error Testing', () => {
    test('Case when token is invalid', () => {
      const res = request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/1`, {
        qs: { token: token.token + '1' },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Case when question ID does not refer to a valid question within this quiz', () => {
      const res = request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/invalid`, {
        qs: { token: token.token },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when user is not the owner of the quiz', () => {
      // Register a new user
      const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: {
          email: 'secondemail@gmail.com',
          password: '1234zyx#@',
          nameFirst: 'John',
          nameLast: 'Doe'
        },
        timeout: TIMEOUT_MS
      });
      const newUserToken = JSON.parse(res1.body.toString());

      const res = request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/1`, {
        qs: { token: newUserToken.token },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });
});
