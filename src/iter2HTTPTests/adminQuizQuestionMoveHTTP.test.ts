import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { timeNow } from '../helper';

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
const INPUT_QUESTION = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [{
    answer: 'Prince Charles',
    correct: true,
  },
  {
    answer: 'Queen Elizabeth',
    correct: false,
  },
  ],
};
const INPUT_QUESTION2 = {
  question: 'Who is Ronaldo?',
  duration: 4,
  points: 5,
  answers: [{
    answer: 'Football player',
    correct: true
  },
  {
    answer: 'Dancer',
    correct: false
  }
  ],
};

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

describe('PUT /v1/admin/quiz/:quizId/question/:questionId/move', () => {
  test('Token is non-existent', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/quiz/0/question/0/move', {
      json: {
        token: '0',
        newPosition: 1
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  describe('After creating tokens', () => {
    let token: {
      token: string
    };
    beforeEach(() => {
      const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
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

    test('Token is not a valid user', () => {
      const res1 = request('PUT', SERVER_URL + '/v1/admin/quiz/0/question/0/move', {
        json: {
          token: token.token + '1',
          newPosition: 1
        },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(401);
    });

    describe('After creating quizzes', () => {
      let quiz1: {
        quizId: number
      };
      beforeEach(() => {
        const quizRes1 = request('POST', SERVER_URL + '/v1/admin/quiz', {
          json: {
            token: token.token,
            name: 'quiz 1',
            description: 'Mathematics Quiz'
          },
          timeout: TIMEOUT_MS
        });
        quiz1 = JSON.parse(quizRes1.body.toString());
      });

      test('QuizId does not exist', () => {
        const res1 = request('PUT', SERVER_URL +
        `/v1/admin/quiz/${quiz1.quizId + 1}/question/0/move`, {
          json: {
            token: token.token,
            newPosition: 1
          },
          timeout: TIMEOUT_MS
        });
        expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
        expect(res1.statusCode).toStrictEqual(403);
      });

      test('User is not an owner of the quiz', () => {
        const resUser2 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
          json: {
            email: 'auth@two.com',
            password: 'authtwo2',
            nameFirst: 'auth',
            nameLast: 'two'
          },
          timeout: TIMEOUT_MS
        });
        const token2 = JSON.parse(resUser2.body.toString());
        const res1 = request('PUT', SERVER_URL +
        `/v1/admin/quiz/${quiz1.quizId}/question/0/move`, {
          json: {
            token: token2.token,
            newPosition: 1
          },
          timeout: TIMEOUT_MS
        });
        expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
        expect(res1.statusCode).toStrictEqual(403);
      });

      describe('After creating questions', () => {
        let questionId: {
          questionId: number
        };
        let questionId2: {
          questionId: number
        };
        beforeEach(() => {
          const questionRes = request('POST', SERVER_URL +
          `/v1/admin/quiz/${quiz1.quizId}/question`, {
            json: {
              token: token.token,
              questionBody: INPUT_QUESTION
            },
            timeout: TIMEOUT_MS
          });
          questionId = JSON.parse(questionRes.body.toString());
          const questionRes2 = request('POST', SERVER_URL +
          `/v1/admin/quiz/${quiz1.quizId}/question`, {
            json: {
              token: token.token,
              questionBody: INPUT_QUESTION2
            }
          });
          questionId2 = JSON.parse(questionRes2.body.toString());
        });

        test('QuestionId is not valid', () => {
          const res1 = request('PUT', SERVER_URL +
          `/v1/admin/quiz/${quiz1.quizId}/question/${questionId.questionId + 1}/move`, {
            json: {
              token: token.token,
              newPosition: 1
            },
            timeout: TIMEOUT_MS
          });
          expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
          expect(res1.statusCode).toStrictEqual(400);
        });

        test('NewPosition is less than 0', () => {
          const res1 = request('PUT', SERVER_URL +
          `/v1/admin/quiz/${quiz1.quizId}/question/${questionId.questionId}/move`, {
            json: {
              token: token.token,
              newPosition: -1
            },
            timeout: TIMEOUT_MS
          });
          expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
          expect(res1.statusCode).toStrictEqual(400);
        });

        test('NewPosition is greater than no of questions', () => {
          const res1 = request('PUT', SERVER_URL +
          `/v1/admin/quiz/${quiz1.quizId}/question/${questionId.questionId}/move`, {
            json: {
              token: token.token,
              newPosition: 2
            },
            timeout: TIMEOUT_MS
          });
          expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
          expect(res1.statusCode).toStrictEqual(400);
        });

        test('NewPosition is the position of the current question', () => {
          const res1 = request('PUT', SERVER_URL +
          `/v1/admin/quiz/${quiz1.quizId}/question/${questionId.questionId}/move`, {
            json: {
              token: token.token,
              newPosition: 0
            },
            timeout: TIMEOUT_MS
          });
          expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
          expect(res1.statusCode).toStrictEqual(400);
        });

        test('Returns correct output and timeLastEdited', () => {
          const res1 = request('PUT', SERVER_URL +
          `/v1/admin/quiz/${quiz1.quizId}/question/${questionId.questionId}/move`, {
            json: {
              token: token.token,
              newPosition: 1
            },
            timeout: TIMEOUT_MS
          });
          expect(JSON.parse(res1.body.toString())).toStrictEqual({});
          const time = timeNow();
          const timeEditedRes = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, {
            qs: {
              token: token.token
            },
            timeout: TIMEOUT_MS
          });
          const timeLastEdited = parseInt(JSON.parse(timeEditedRes.body.toString()).timeLastEdited);
          expect(timeLastEdited).toBeGreaterThanOrEqual(time);
          expect(timeLastEdited).toBeLessThanOrEqual(time + 1);
        });

        test('Correctly moves a question with 2 questions', () => {
          const res1 = request('PUT', SERVER_URL +
          `/v1/admin/quiz/${quiz1.quizId}/question/${questionId.questionId}/move`, {
            json: {
              token: token.token,
              newPosition: 1
            },
            timeout: TIMEOUT_MS
          });
          expect(JSON.parse(res1.body.toString())).toStrictEqual({});

          const quizRes2 = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, {
            qs: {
              token: token.token
            },
            timeout: TIMEOUT_MS
          });
          const quiz = JSON.parse(quizRes2.body.toString());
          expect(quiz.questions).toStrictEqual([{
            questionId: questionId2.questionId,
            question: INPUT_QUESTION2.question,
            duration: INPUT_QUESTION2.duration,
            points: INPUT_QUESTION2.points,
            answers: [{
              answerId: expect.any(Number),
              answer: 'Football player',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Dancer',
              colour: expect.any(String),
              correct: false,
            },
            ],
          },
          {
            questionId: questionId.questionId,
            question: INPUT_QUESTION.question,
            duration: INPUT_QUESTION.duration,
            points: INPUT_QUESTION.points,
            answers: [{
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
          }
          ]);

          const time = timeNow();
          const timeEditedRes = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, {
            qs: {
              token: token.token
            },
            timeout: TIMEOUT_MS
          });
          const timeLastEdited = parseInt(JSON.parse(timeEditedRes.body.toString()).timeLastEdited);
          expect(timeLastEdited).toBeGreaterThanOrEqual(time);
          expect(timeLastEdited).toBeLessThanOrEqual(time + 1);
        });

        test('Correctly moves a question with 3 questions', () => {
          const INPUT_QUESTION3 = {
            question: 'What colour is an orange?',
            duration: 4,
            points: 5,
            answers: [{
              answer: 'Orange',
              correct: true
            },
            {
              answer: 'Blue',
              correct: false
            }
            ],
          };
          const questionRes3 = request('POST', SERVER_URL +
          `/v1/admin/quiz/${quiz1.quizId}/question`, {
            json: {
              token: token.token,
              questionBody: INPUT_QUESTION3
            }
          });
          const questionId3 = JSON.parse(questionRes3.body.toString());
          const res1 = request('PUT', SERVER_URL +
          `/v1/admin/quiz/${quiz1.quizId}/question/${questionId3.questionId}/move`, {
            json: {
              token: token.token,
              newPosition: 1
            },
            timeout: TIMEOUT_MS
          });
          expect(JSON.parse(res1.body.toString())).toStrictEqual({});

          const quizRes2 = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, {
            qs: {
              token: token.token
            },
            timeout: TIMEOUT_MS
          });
          const quiz = JSON.parse(quizRes2.body.toString());
          expect(quiz.questions).toStrictEqual([{
            questionId: questionId.questionId,
            question: INPUT_QUESTION.question,
            duration: INPUT_QUESTION.duration,
            points: INPUT_QUESTION.points,
            answers: [{
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
            questionId: questionId3.questionId,
            question: INPUT_QUESTION3.question,
            duration: INPUT_QUESTION3.duration,
            points: INPUT_QUESTION3.points,
            answers: [{
              answerId: expect.any(Number),
              answer: 'Orange',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Blue',
              colour: expect.any(String),
              correct: false,
            },
            ],
          },
          {
            questionId: questionId2.questionId,
            question: INPUT_QUESTION2.question,
            duration: INPUT_QUESTION2.duration,
            points: INPUT_QUESTION2.points,
            answers: [{
              answerId: expect.any(Number),
              answer: 'Football player',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Dancer',
              colour: expect.any(String),
              correct: false,
            },
            ],
          },
          ]);

          const time = timeNow();
          const timeEditedRes = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, {
            qs: {
              token: token.token
            },
            timeout: TIMEOUT_MS
          });
          const timeLastEdited = parseInt(JSON.parse(timeEditedRes.body.toString()).timeLastEdited);
          expect(timeLastEdited).toBeGreaterThanOrEqual(time);
          expect(timeLastEdited).toBeLessThanOrEqual(time + 1);
        });
      });
    });
  });
});
