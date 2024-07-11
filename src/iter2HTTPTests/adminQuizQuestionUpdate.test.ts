import request from 'sync-request-curl';
import { port, url } from '../config.json';

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('PUT /v1/admin/quiz/:quizid/question/:questionid', () => {
  let token: { token: string };
  test('Successfully updates the question', () => {
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
        token,
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

    const quiz = JSON.parse(res2.body.toString());
    const quizId = quiz.quizid;
    const questionId = quiz.questions[0].questionid;

    const res3 = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId}`, {
      json: {
        token,
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

    expect(JSON.parse(res3.body.toString())).toStrictEqual({});
    expect(res3.statusCode).toStrictEqual(200);

    // Verify update
    const res4 = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId}`, {
      qs: { token },
      timeout: TIMEOUT_MS
    });

    const updatedQuestion = JSON.parse(res4.body.toString());
    expect(updatedQuestion).toMatchObject({
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: expect.arrayContaining([
        { answer: 'Prince Charles', correct: true },
        { answer: 'Queen Elizabeth', correct: false }
      ])
    });
  });

  describe('Error Testing', () => {
    beforeEach(() => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register',
        {
          json: {
            email: 'bettyBoop@gmail.com',
            password: 'helloWorld1',
            nameFirst: 'Betty',
            nameLast: 'Boop'
          },
          timeout: TIMEOUT_MS
        });
      token = JSON.parse(res.body.toString());
    });

    test('Case when token is invalid', () => {
      const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/1`, {
        json: {
          token: 'invalid-token',
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

      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Case when question ID is invalid', () => {
      const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/invalid`, {
        json: {
          token,
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

      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when question is too short or too long', () => {
      // Too short
      let res = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/1`, {
        json: {
          token,
          questionBody: {
            question: 'Too',
            duration: 4,
            points: 5,
            answers: [
              { answer: 'Answer 1', correct: false },
              { answer: 'Answer 2', correct: true }
            ]
          }
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);

      // Too long
      res = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/1`, {
        json: {
          token,
          questionBody: {
            question: 'A'.repeat(51),
            duration: 4,
            points: 5,
            answers: [
              { answer: 'Answer 1', correct: false },
              { answer: 'Answer 2', correct: true }
            ]
          }
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when there are too few or too many answers', () => {
      // Too few answers
      let res = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/1`, {
        json: {
          token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [{ answer: 'Prince Charles', correct: true }]
          }
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);

      // Too many answers
      res = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/1`, {
        json: {
          token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [
              { answer: 'Answer 1', correct: false },
              { answer: 'Answer 2', correct: false },
              { answer: 'Answer 3', correct: false },
              { answer: 'Answer 4', correct: false },
              { answer: 'Answer 5', correct: false },
              { answer: 'Answer 6', correct: true },
              { answer: 'Answer 7', correct: false }
            ]
          }
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when duration is not a positive number or exceeds total duration', () => {
      // Non-positive duration
      let res = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/1`, {
        json: {
          token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 0,
            points: 5,
            answers: [
              { answer: 'Prince Charles', correct: true },
              { answer: 'Queen Elizabeth', correct: false }
            ]
          }
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);

      // Exceeds total duration
      res = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/1`, {
        json: {
          token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 181, // Exceeds the total quiz duration of 180 seconds
            points: 5,
            answers: [
              { answer: 'Prince Charles', correct: true },
              { answer: 'Queen Elizabeth', correct: false }
            ]
          }
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when points are out of valid range', () => {
      // Points less than 1
      let res = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/1`, {
        json: {
          token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 0,
            answers: [
              { answer: 'Prince Charles', correct: true },
              { answer: 'Queen Elizabeth', correct: false }
            ]
          }
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);

      // Points greater than 10
      res = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/1`, {
        json: {
          token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 11,
            answers: [
              { answer: 'Prince Charles', correct: true },
              { answer: 'Queen Elizabeth', correct: false }
            ]
          }
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when answer strings are duplicates or too long', () => {
      // Duplicate answers
      let res = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/1`, {
        json: {
          token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [
              { answer: 'Prince Charles', correct: true },
              { answer: 'Prince Charles', correct: false }
            ]
          }
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);

      // Answer too long
      res = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/1`, {
        json: {
          token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [
              { answer: 'A'.repeat(31), correct: true },
              { answer: 'Queen Elizabeth', correct: false }
            ]
          }
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);

      // Answer too short
      res = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/1`, {
        json: {
          token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [
              { answer: '', correct: true },
              { answer: 'Queen Elizabeth', correct: false }
            ]
          }
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when there are no correct answers', () => {
      const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/1`, {
        json: {
          token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [
              { answer: 'Prince Charles', correct: false },
              { answer: 'Queen Elizabeth', correct: false }
            ]
          }
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when user is not an owner of the quiz or quiz does not exist', () => {
      // Use a different token (not the quiz owner's token) to attempt the update
      const res2 = request('PUT', `${SERVER_URL}/v1/admin/quiz/1/question/1`, {
        json: {
          token: 'different-token',
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

      // Verify the response
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(403);
    });
  });
});
