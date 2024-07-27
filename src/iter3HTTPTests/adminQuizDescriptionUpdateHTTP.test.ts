import * as HTTP from './HTTPHelper';
import { timeNow } from '../helper';

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

describe('POST /v2/admin/quiz/:quizid/description', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const resUser = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(resUser.body.toString()).token;
    const resQuiz = HTTP.adminQuizCreate({ token: token, name: 'Quiz1', description: 'Betty\'s quiz' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;
  });

  describe('error testing', () => {
    test('returns an error for a description that is too long', () => {
      const veryLongString = '10charlong :)'.repeat(10);
      const res = HTTP.adminQuizDescriptionUpdate({ token: token, quizid: quizId, description: veryLongString });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for invalid token', () => {
      const res = HTTP.adminQuizDescriptionUpdate({ token: token + 1, quizid: quizId, description: 'Norman\'s quiz' });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('returns an error for invalid quizId', () => {
      const res = HTTP.adminQuizDescriptionUpdate({ token: token, quizid: quizId + 1, description: 'Norman\'s quiz' });
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

      const res = HTTP.adminQuizDescriptionUpdate({ token: token, quizid: quizId2, description: 'Norman\'s quiz' });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = HTTP.adminQuizDescriptionUpdate({ token: token, quizid: quizId, description: 'Norman\'s quiz' });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('correctly returns for an empty string', () => {
      const res = HTTP.adminQuizDescriptionUpdate({ token: token, quizid: quizId, description: '' });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('successfully updates the description of a quiz and the timeLastEdited', () => {
      HTTP.adminQuizDescriptionUpdate({ token: token, quizid: quizId, description: 'Norman\'s quiz' });
      const time = timeNow();
      const res = HTTP.adminQuizInfo({ token: token, quizid: quizId });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        quizId: quizId,
        name: 'Quiz1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Norman\'s quiz',
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number)
      });

      const timeLastEdited = parseInt(JSON.parse(res.body.toString()).timeLastEdited);
      expect(timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(timeLastEdited).toBeLessThanOrEqual(time + 1);
    });

    test('successfully updates the dscription of multiple quizzes', () => {
      const resQuiz2 = HTTP.adminQuizCreate({ token: token, name: 'Quiz2', description: 'Norman\'s quiz' });
      const quizId2 = JSON.parse(resQuiz2.body.toString()).quizId;

      HTTP.adminQuizDescriptionUpdate({ token: token, quizid: quizId, description: 'New description1' });
      HTTP.adminQuizDescriptionUpdate({ token: token, quizid: quizId2, description: 'New description2' });

      const res1 = HTTP.adminQuizInfo({ token: token, quizid: quizId });
      expect(JSON.parse(res1.body.toString())).toStrictEqual({
        quizId: quizId,
        name: 'Quiz1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'New description1',
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number)
      });

      const res2 = HTTP.adminQuizInfo({ token: token, quizid: quizId2 });
      expect(JSON.parse(res2.body.toString())).toStrictEqual({
        quizId: quizId2,
        name: 'Quiz2',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'New description2',
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number)
      });
    });
  });
});
