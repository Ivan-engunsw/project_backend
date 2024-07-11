import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
const ERROR = { error: expect.any(String) };
const INPUT_USER = { email: 'betty@unsw.com', password: 'password1', nameFirst: 'Betty', nameLast: 'Boop' };

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('POST /v1/admin/quiz/{quizid}/question', () => {
  let token: { token: string };
  let quiz: { quizId: number };
  let inputQuestion: {
    question: string;
    duration: number;
    points: number;
    answers: { answer: string, correct: boolean }[];
  };
  beforeEach(() => {
    const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: INPUT_USER, timeout: TIMEOUT_MS });
    token = JSON.parse(resUser.body.toString());
    const inputQuiz = { token: token.token, name: 'Quiz1', description: 'Betty\'s quiz' };
    const resQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: inputQuiz, timeout: TIMEOUT_MS });
    quiz = JSON.parse(resQuiz.body.toString());

    inputQuestion = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Queen Elizabeth', correct: false },
      ],
    };
  });

  describe('error testing', () => {
    test('returns an error for invalid question length', () => {
      inputQuestion.question = 'Uh?';
      const res1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputQuestion.question = 'Sometimes I wonder what question I\'m even asking like is there even any point to asking this?';
      const res2 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('returns an error for an invalid number of answers', () => {
      inputQuestion.answers = [
        { answer: 'Prince Charles', correct: true },
      ];
      const res1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputQuestion.answers = [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Queen Elizabeth', correct: false },
        { answer: 'Mary II', correct: false },
        { answer: 'Charles II', correct: false },
        { answer: 'King Arthur', correct: false },
        { answer: 'Henry VIII', correct: false },
        { answer: 'Edward VI', correct: true },
      ];
      const res2 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('returns an error for invalid duration', () => {
      inputQuestion.duration = -1;
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for invalid points', () => {
      inputQuestion.points = 0;
      const res1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputQuestion.points = 49;
      const res2 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('returns an error for invalid answer length', () => {
      inputQuestion.answers = [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Prince Charles Junior Knight The Fourth Knave', correct: false },
      ];
      const res1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputQuestion.answers = [
        { answer: '', correct: true },
        { answer: 'Queen Elizabeth', correct: false },
      ];
      const res2 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('returns an error for duplicate answers', () => {
      inputQuestion.answers = [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Prince Charles', correct: false },
        { answer: 'Queen Elizabeth', correct: false },
      ];
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error when there are no correct answers', () => {
      inputQuestion.answers = [
        { answer: 'Prince Charles', correct: false },
        { answer: 'Queen Elizabeth', correct: false },
      ];
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error when question duration exceeds 3 minutes', () => {
      inputQuestion.duration = 181;
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error when question causes quiz duration to exceed 3 minutes', () => {
      request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      const questionBody = {
        question: 'Why is English food so bad?',
        duration: 177,
        points: 5,
        answers: [
          { answer: 'Because they have no culture', correct: true },
          { answer: 'I\'m not sure', correct: false },
        ],
      };
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for an invalid token', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token + 1, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('returns an error for an invalid quizId', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId + 1}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('returns an error for an quiz not owned by the user', () => {
      const resUser2 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'norman@unsw.com', password: 'password1', nameFirst: 'Norman', nameLast: 'Nile' }, timeout: TIMEOUT_MS });
      const token2 = JSON.parse(resUser2.body.toString());
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token2.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      expect(JSON.parse(res.body.toString())).toStrictEqual({ questionId: expect.any(Number) });
    });

    test('correctly creates a question', () => {
      const resQues = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      const question = JSON.parse(resQues.body.toString());
      const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: token, timeout: TIMEOUT_MS });
      const resQuiz = JSON.parse(res.body.toString());
      expect(resQuiz.numQuestions).toStrictEqual(1);
      expect(resQuiz.questions).toStrictEqual([
        {
          questionId: question.questionId,
          question: inputQuestion.question,
          duration: inputQuestion.duration,
          points: inputQuestion.points,
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
      ]);
      expect(resQuiz.duration).toStrictEqual(inputQuestion.duration);
    });

    test('correctly creates multiple questions', () => {
      const resQues1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: inputQuestion }, timeout: TIMEOUT_MS });
      const question1 = JSON.parse(resQues1.body.toString());

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
      const resQues2 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}/question`, { json: { token: token.token, questionBody: questionBody }, timeout: TIMEOUT_MS });
      const question2 = JSON.parse(resQues2.body.toString());
      const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz.quizId}`, { qs: token, timeout: TIMEOUT_MS });
      const resQuiz = JSON.parse(res.body.toString());
      expect(resQuiz.numQuestions).toStrictEqual(2);
      expect(resQuiz.questions).toStrictEqual([
        {
          questionId: question1.questionId,
          question: inputQuestion.question,
          duration: inputQuestion.duration,
          points: inputQuestion.points,
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
          questionId: question2.questionId,
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
      ]);
      expect(resQuiz.duration).toStrictEqual(inputQuestion.duration + questionBody.duration);
    });
  });
});
