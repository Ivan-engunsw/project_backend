import * as HTTP from './HTTPHelper';

// CONSTANTS //
const INPUT_USER_1 = {
  email: 'betty@unsw.com',
  password: 'password1',
  nameFirst: 'Betty',
  nameLast: 'Boop'
};
const INPUT_USER_2 = {
  email: 'norman@unsw.com',
  password: 'password1',
  nameFirst: 'Norman',
  nameLast: 'Nile'
};
const ERROR = { error: expect.any(String) };

// TESTING //
beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('POST /v1/admin/quiz/:quizid/transfer', () => {
  let token1: string;
  let token2: string;
  let quizId: number;
  beforeEach(() => {
    const resUser = HTTP.adminAuthRegister(INPUT_USER_1);
    token1 = JSON.parse(resUser.body.toString()).token;
    const resQuiz = HTTP.adminQuizCreate({ token: token1, name: 'Quiz1', description: 'Betty\'s quiz' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;

    const resUser2 = HTTP.adminAuthRegister(INPUT_USER_2);
    token2 = JSON.parse(resUser2.body.toString()).token;
  });

  describe('error testing', () => {
    test('returns an error for an invalid target email', () => {
      const res = HTTP.adminQuizTransfer({ token: token1, quizid: quizId, userEmail: 'notanemail@unsw.com' });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for the current user\'s email', () => {
      const res = HTTP.adminQuizTransfer({ token: token1, quizid: quizId, userEmail: INPUT_USER_1.email });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for a quiz name already in use by the target', () => {
      HTTP.adminQuizCreate({ token: token2, name: 'Quiz1', description: 'Norman\'s quiz' });
      const res = HTTP.adminQuizTransfer({ token: token1, quizid: quizId, userEmail: INPUT_USER_2.email });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for a quiz not owned by this user', () => {
      const resQuiz2 = HTTP.adminQuizCreate({ token: token2, name: 'Quiz1', description: 'Norman\'s quiz' });
      const quizId2 = JSON.parse(resQuiz2.body.toString()).quizId;
      const res = HTTP.adminQuizTransfer({ token: token1, quizid: quizId2, userEmail: INPUT_USER_2.email });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('returns an error for an invalid token', () => {
      const res = HTTP.adminQuizTransfer({ token: token1 + 1, quizid: quizId, userEmail: INPUT_USER_2.email });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('returns an error for an invalid quizId', () => {
      const res = HTTP.adminQuizTransfer({ token: token1, quizid: quizId + 1, userEmail: INPUT_USER_2.email });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = HTTP.adminQuizTransfer({ token: token1, quizid: quizId, userEmail: INPUT_USER_2.email });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('quiz is successfully transferred to target', () => {
      HTTP.adminQuizTransfer({ token: token1, quizid: quizId, userEmail: INPUT_USER_2.email });
      const res = HTTP.adminQuizInfo({ token: token2, quizid: quizId });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        quizId: quizId,
        name: 'Quiz1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Betty\'s quiz',
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number)
      });
    });
  });
});
