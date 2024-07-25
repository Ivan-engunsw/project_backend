import * as HTTP from './HTTPHelper';

// CONSTANTS //
const ERROR = { error: expect.any(String) };

// TESTING //
beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('GET /v1/admin/quiz/:quizid', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const resUser = HTTP.adminAuthRegister({
      email: 'auth@one.com',
      password: 'authone1',
      nameFirst: 'auth',
      nameLast: 'one'
    });
    token = JSON.parse(resUser.body.toString()).token;

    const resQuiz = HTTP.adminQuizCreate({ token: token, name: 'first', description: 'desc' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;
  });

  describe('adminQuizInfo HTTP tests', () => {
    test('AuthUserId is not a valid user', () => {
      const res = HTTP.adminQuizInfo({ token: token + 1, quizid: quizId });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Quiz ID does not refer to a valid quiz', () => {
      const res = HTTP.adminQuizInfo({ token: token, quizid: quizId + 1 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('Quiz ID does not refer to a quiz that this user owns', () => {
      const resUser2 = HTTP.adminAuthRegister({
        email: 'auth@two.com',
        password: 'authtwo2',
        nameFirst: 'auth',
        nameLast: 'two'
      });
      const token2 = JSON.parse(resUser2.body.toString()).token;

      const res = HTTP.adminQuizInfo({ token: token2, quizid: quizId });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('Successfully view one quiz', () => {
      const res = HTTP.adminQuizInfo({ token: token, quizid: quizId });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        quizId: quizId,
        name: 'first',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'desc',
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number)
      });
    });

    test('Successfully view multiple quizzes', () => {
      const resQuiz2 = HTTP.adminQuizCreate({ token: token, name: 'second', description: 'desc' });
      const quizId2 = JSON.parse(resQuiz2.body.toString()).quizId;

      const resUser2 = HTTP.adminAuthRegister({
        email: 'auth@two.com',
        password: 'authtwo2',
        nameFirst: 'auth',
        nameLast: 'two'
      });
      const token2 = JSON.parse(resUser2.body.toString()).token;

      const resQuiz3 = HTTP.adminQuizCreate({ token: token2, name: 'third', description: 'desc' });
      const quizId3 = JSON.parse(resQuiz3.body.toString()).quizId;

      const res1 = HTTP.adminQuizInfo({ token: token, quizid: quizId });
      expect(JSON.parse(res1.body.toString())).toStrictEqual({
        quizId: quizId,
        name: 'first',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'desc',
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number)
      });

      const res2 = HTTP.adminQuizInfo({ token: token, quizid: quizId2 });
      expect(JSON.parse(res2.body.toString())).toStrictEqual({
        quizId: quizId2,
        name: 'second',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'desc',
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number)
      });

      const res3 = HTTP.adminQuizInfo({ token: token2, quizid: quizId3 });
      expect(JSON.parse(res3.body.toString())).toStrictEqual({
        quizId: quizId3,
        name: 'third',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'desc',
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number)
      });
    });
  });
});
