import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
const INPUT_QUESTION = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [
    {
      answer: 'Prince Charles',
      correct: true,
    },
    {
      answer: 'Queen Elizabeth',
      correct: false,
    },
  ],
};
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('POST /v1/admin/quiz/{quizid}/question', () => {
  let token: { token: string };
  let quiz: { quizId: number };
  beforeEach(() => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'betty@unsw.com', password: 'password1', nameFirst: 'Betty', nameLast: 'Boop' }, timeout: TIMEOUT_MS });
    token = JSON.parse(resUser.body.toString());
    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token.token, name: 'Quiz1', description: 'Betty\'s quiz' }, timeout: TIMEOUT_MS });
    quiz = JSON.parse(resQuiz.body.toString());
  });

  describe('error testing', () => {
    test('returns an error for invalid question length', () => {
      const questionBody = {
        question: 'Uh?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Queen Elizabeth',
            correct: false,
          },
        ],
      };
      const res1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      questionBody.question = 'Sometimes I wonder what question I\'m even asking like is there even any point to asking this?';
      const res2 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('returns an error for an invalid number of answers', () => {
      const questionBody = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
        ],
      };
      const res1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      questionBody.answers = [
        {
          answer: 'Prince Charles',
          correct: true,
        },
        {
          answer: 'Queen Elizabeth',
          correct: false,
        },
        {
          answer: 'Mary II',
          correct: false,
        },
        {
          answer: 'Charles II',
          correct: false,
        },
        {
          answer: 'King Arthur',
          correct: false,
        },
        {
          answer: 'Henry VIII',
          correct: false,
        },
        {
          answer: 'Edward VI',
          correct: true,
        },
      ];

      const res2 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('returns an error for invalid duration', () => {
      const questionBody = {
        question: 'Who is the Monarch of England?',
        duration: -1,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Queen Elizabeth',
            correct: false,
          },
        ],
      };
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for invalid points', () => {
      const questionBody = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 0,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Queen Elizabeth',
            correct: false,
          },
        ],
      };
      const res1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      questionBody.points = 49;
      const res2 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('returns an error for invalid answer length', () => {
      const questionBody = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Prince Charles Junior Knight The Fourth Knave',
            correct: false,
          },
        ],
      };
      const res1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      questionBody.answers = [
        {
          answer: '',
          correct: true,
        },
        {
          answer: 'Queen Elizabeth',
          correct: false,
        },
      ];
      const res2 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('returns an error for duplicate answers', () => {
      const questionBody = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Prince Charles',
            correct: false,
          },
          {
            answer: 'Queen Elizabeth',
            correct: false,
          },
        ],
      };
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error when there are no correct answers', () => {
      const questionBody = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: false,
          },
          {
            answer: 'Queen Elizabeth',
            correct: false,
          },
        ],
      };
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error when question duration exceeds 3 minutes', () => {
      const questionBody = {
        question: 'Who is the Monarch of England?',
        duration: 181,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Queen Elizabeth',
            correct: false,
          },
        ],
      };
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error when question causes quiz duration to exceed 3 minutes', () => {
      request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: INPUT_QUESTION }, timeout: TIMEOUT_MS });
      const questionBody = {
        question: 'Why is English food so bad?',
        duration: 177,
        points: 5,
        answers: [
          {
            answer: 'Because they have no culture',
            correct: true,
          },
          {
            answer: 'I\'m not sure',
            correct: false,
          },
        ],
      };
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for an invalid token', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token + 1, questionBody: INPUT_QUESTION }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('returns an error for an invalid quizId', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId + 1}/question`, { json: { token: token.token, questionBody: INPUT_QUESTION }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('returns an error for an quiz not owned by the user', () => {
      const resUser2 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'norman@unsw.com', password: 'password1', nameFirst: 'Norman', nameLast: 'Nile' }, timeout: TIMEOUT_MS });
      const token2 = JSON.parse(resUser2.body.toString());
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token2.token, questionBody: INPUT_QUESTION }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: INPUT_QUESTION }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual({ questionId: expect.any(Number) });
    });

    test('correctly creates a question', () => {
      request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: INPUT_QUESTION }, timeout: TIMEOUT_MS });
      const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: token, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        quizId: quiz.quizId,
        name: 'Quiz1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Betty\'s quiz',
        numQuestions: 1,
        questions: [
          {
            questionId: expect.any(Number),
            question: INPUT_QUESTION.question,
            duration: INPUT_QUESTION.duration,
            points: INPUT_QUESTION.points,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Prince Charles',
                colour: expect.any(String),
                correct: true,
              },
              {
                answerId: expect.any(Number),
                answer: 'Queen Elizabeth',
                colour: expect.any(String),
                correct: false,
              },
            ],
          },
        ],
        duration: INPUT_QUESTION.duration,
      });
    });

    test('correctly creates multiple questions', () => {
      request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: INPUT_QUESTION }, timeout: TIMEOUT_MS });
      const questionBody = {
        question: 'Why is English food so bad?',
        duration: 11,
        points: 5,
        answers: [
          {
            answer: 'Because they have no culture',
            correct: true,
          },
          {
            answer: 'I\'m not sure',
            correct: false,
          },
        ],
      };
      request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: token, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        quizId: quiz.quizId,
        name: 'Quiz1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Betty\'s quiz',
        numQuestions: 2,
        questions: [
          {
            questionId: expect.any(Number),
            question: INPUT_QUESTION.question,
            duration: INPUT_QUESTION.duration,
            points: INPUT_QUESTION.points,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Prince Charles',
                colour: expect.any(String),
                correct: true,
              },
              {
                answerId: expect.any(Number),
                answer: 'Queen Elizabeth',
                colour: expect.any(String),
                correct: false,
              },
            ],
          },
          {
            questionId: expect.any(Number),
            question: questionBody.question,
            duration: questionBody.duration,
            points: questionBody.points,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Because they have no culture',
                colour: expect.any(String),
                correct: true,
              },
              {
                answerId: expect.any(Number),
                answer: 'I\'m not sure',
                colour: expect.any(String),
                correct: false,
              },
            ],
          },
        ],
        duration: INPUT_QUESTION.duration + questionBody.duration,
      });
    });
  });
});
