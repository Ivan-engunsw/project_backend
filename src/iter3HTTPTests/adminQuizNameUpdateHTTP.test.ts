import * as HTTP from './HTTPHelper';
import { timeNow } from '../helper';

// CONSTANTS //
const ERROR = { error: expect.any(String) };
const INPUT_USER = {
  email: 'betty@unsw.com',
  password: 'password1',
  nameFirst: 'Betty',
  nameLast: 'Boop'
};

// TESTING //
beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('PUT /v1/admin/quiz/:quizid/name', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const resUser = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(resUser.body.toString()).token;
    const resQuiz = HTTP.adminQuizCreate({ token: token, name: 'Quiz1', description: 'Betty\'s quiz' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;
  });

  describe('error testing', () => {
    test.each([{
      name: ''
    },
    {
      name: '12'
    },
    {
      name: 'ab'
    },
    {
      name: 'abcdefghijklmnopqrstuvwxyz123456'
    },
    {
      name: '@!#$&#)$)*#$*__!@(**@'
    },
    ])('returns an error for invalid names', ({
      name
    }) => {
      const res = HTTP.adminQuizNameUpdate({ token: token, quizid: quizId, name: name });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for name already in use', () => {
      HTTP.adminQuizCreate({ token: token, name: 'Quiz2', description: 'Betty\'s quiz' });
      const res = HTTP.adminQuizNameUpdate({ token: token, quizid: quizId, name: 'Quiz2' });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for invalid token', () => {
      const res = HTTP.adminQuizNameUpdate({ token: token + 1, quizid: quizId, name: 'Quiz2' });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('returns an error for invalid quizId', () => {
      const res = HTTP.adminQuizNameUpdate({ token: token, quizid: quizId + 1, name: 'Quiz2' });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('returns an error for a quiz not owned by this user', () => {
      const resUser2 = HTTP.adminAuthRegister({
        email: 'norman@unsw.com',
        password: 'password1',
        nameFirst: 'Norman',
        nameLast: 'Nile'
      });
      const token2 = JSON.parse(resUser2.body.toString()).token;
      const resQuiz2 = HTTP.adminQuizCreate({ token: token2, name: 'Quiz2', description: 'Norman\'s quiz' });
      const quizId2 = JSON.parse(resQuiz2.body.toString()).quizId;

      const res = HTTP.adminQuizNameUpdate({ token: token, quizid: quizId2, name: 'Quiz2' });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = HTTP.adminQuizNameUpdate({ token: token, quizid: quizId, name: 'New quiz1' });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('successfully updates the name of a quiz and timeLastEdited', () => {
      HTTP.adminQuizNameUpdate({ token: token, quizid: quizId, name: 'New quiz1' });
      const time = timeNow();
      const res = HTTP.adminQuizInfo({ token: token, quizid: quizId });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        quizId: quizId,
        name: 'New quiz1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Betty\'s quiz',
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number)
      });

      const timeLastEdited = parseInt(JSON.parse(res.body.toString()).timeLastEdited);
      expect(timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(timeLastEdited).toBeLessThanOrEqual(time + 1);
    });

    test('successfully updates the name of multiple quizzes', () => {
      const resQuiz2 = HTTP.adminQuizCreate({ token: token, name: 'Quiz2', description: 'Norman\'s quiz' });
      const quizId2 = JSON.parse(resQuiz2.body.toString()).quizId;
      HTTP.adminQuizNameUpdate({ token: token, quizid: quizId, name: 'New quiz1' });
      HTTP.adminQuizNameUpdate({ token: token, quizid: quizId2, name: 'New quiz2' });

      const res = HTTP.adminQuizList({ token: token });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        quizzes: [
        {
          quizId: quizId,
          name: 'New quiz1',
        },
        {
          quizId: quizId2,
          name: 'New quiz2',
        },
        ]
      });
    });
  });
});
