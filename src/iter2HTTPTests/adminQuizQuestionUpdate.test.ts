import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { timeNow } from '../helper';

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('PUT /v1/admin/quiz/:quizid/question/:questionId', () => {
  let token: { token: string };
  let quiz: { quizId: number };
  let question: { questionId: number };
  let inputUpdate: {
    question: string;
    duration: number;
    points: number;
    answers: { answer: string, correct: boolean }[];
  };
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

    const res2 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token.token,
        name: 'Sample Quiz',
        description: 'For testing purposes quiz'
      },
      timeout: TIMEOUT_MS
    });
    quiz = JSON.parse(res2.body.toString());

    const resQues = request('POST', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/`, {
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
    question = JSON.parse(resQues.body.toString());

    inputUpdate = {
      question: 'Who is the current Monarch of England?',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Queen Elizabeth', correct: false }
      ]
    };
  });

  describe('functionality testing', () => {
    test('Successfully updates the question', () => {
      const time = timeNow();
      const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});

      const resQuiz = request('GET', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}`, {
        qs: token,
        timeout: TIMEOUT_MS
      });
      const updatedQuestion = JSON.parse(resQuiz.body.toString()).questions;
      expect(updatedQuestion).toStrictEqual([{
        questionId: question.questionId,
        question: 'Who is the current Monarch of England?',
        duration: 5,
        points: 5,
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
      }]);
      expect(JSON.parse(resQuiz.body.toString()).timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(JSON.parse(resQuiz.body.toString()).timeLastEdited).toBeLessThanOrEqual(time + 1);
      expect(JSON.parse(resQuiz.body.toString()).duration).toStrictEqual(inputUpdate.duration);
    });
  });

  describe('Error Testing', () => {
    test('Case when token is invalid', () => {
      const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token.token + '1', questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Case when question ID is invalid', () => {
      const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId + 1}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when question is too short or too long', () => {
      inputUpdate.question = 'Too';
      let res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);

      inputUpdate.question = 'A'.repeat(51);
      res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when there are too few or too many answers', () => {
      inputUpdate.answers = [{ answer: 'Prince Charles', correct: true }];
      let res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);

      inputUpdate.answers = [
        { answer: 'Answer 1', correct: false },
        { answer: 'Answer 2', correct: false },
        { answer: 'Answer 3', correct: false },
        { answer: 'Answer 4', correct: false },
        { answer: 'Answer 5', correct: false },
        { answer: 'Answer 6', correct: true },
        { answer: 'Answer 7', correct: false }
      ];
      res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when duration is not a positive number or exceeds total duration', () => {
      inputUpdate.duration = -1;
      let res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);

      inputUpdate.duration = 181;
      res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when points are out of valid range', () => {
      inputUpdate.points = 0;
      let res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);

      inputUpdate.points = 11;
      res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when answer strings are duplicates or too long', () => {
      inputUpdate.answers = [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Prince Charles', correct: false }
      ];
      let res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);

      inputUpdate.answers = [
        { answer: 'A'.repeat(31), correct: true },
        { answer: 'Queen Elizabeth', correct: false }
      ];
      res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);

      inputUpdate.answers = [
        { answer: '', correct: true },
        { answer: 'Queen Elizabeth', correct: false }
      ];
      res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when there are no correct answers', () => {
      inputUpdate.answers = [
        { answer: 'Prince Charles', correct: false },
        { answer: 'Queen Elizabeth', correct: false }
      ];
      const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when user is not an owner of the quiz or quiz does not exist', () => {
      const resUser = request('POST', SERVER_URL + '/v1/admin/auth/register',
        {
          json: {
            email: 'brattyBoop@gmail.com',
            password: 'helloEarth12',
            nameFirst: 'Betty',
            nameLast: 'Boop'
          },
          timeout: TIMEOUT_MS
        });
      const token2 = JSON.parse(resUser.body.toString());

      const res1 = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
        json: { token: token2.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(403);

      const res2 = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quiz.quizId + 1}/question/${question.questionId}`, {
        json: { token: token.token, questionBody: inputUpdate },
        timeout: TIMEOUT_MS
      });

      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(403);
    });
  });
});
