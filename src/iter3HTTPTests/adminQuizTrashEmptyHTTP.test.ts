import * as HTTP from './HTTPHelper';

// CONSTANTS //
const ERROR = { error: expect.any(String) };
const INPUT_USER_1 = {
  email: 'validemail1@gmail.com',
  password: 'password1!',
  nameFirst: 'Bobby',
  nameLast: 'Bob'
};
const INPUT_USER_2 = {
  email: 'validemail2@gmail.com',
  password: 'password1!',
  nameFirst: 'Bobby',
  nameLast: 'Bob'
};

// TESTING //
beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('DELETE /v2/admin/quiz/trash/empty', () => {
  let quizIds: number[];
  let token: string;
  let quizId: number;
  beforeEach(() => {
    quizIds = [];
    const resUser = HTTP.adminAuthRegister(INPUT_USER_1);
    token = JSON.parse(resUser.body.toString()).token;
    const resQuiz = HTTP.adminQuizCreate({ token: token, name: 'Sample Quiz', description: 'My quiz' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;
    quizIds.push(quizId);
  });

  describe('Error Testing', () => {
    test('One of users quiz is not currently in the trash', () => {
      const res = HTTP.adminQuizTrashEmpty({ token: token, quizIds: quizIds });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('All but one quiz is in the trash', () => {
      const resQuiz1 = HTTP.adminQuizCreate({ token: token, name: 'Quiz 1', description: 'Quiz to be deleted' });
      const resQuiz2 = HTTP.adminQuizCreate({ token: token, name: 'Quiz 2', description: 'Quiz to be deleted' });
      const quizId1 = JSON.parse(resQuiz1.body.toString()).quizId;
      const quizId2 = JSON.parse(resQuiz2.body.toString()).quizId;
      HTTP.adminQuizRemove({ token: token, quizid: quizId1 });
      HTTP.adminQuizRemove({ token: token, quizid: quizId2 });

      quizIds.push(quizId1);
      quizIds.push(quizId2);
      const res = HTTP.adminQuizTrashEmpty({ token: token, quizIds: quizIds });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Token is invalid', () => {
      HTTP.adminQuizRemove({ token: token, quizid: quizId });

      const res = HTTP.adminQuizTrashEmpty({ token: token + 1, quizIds: quizIds });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Valid user but quizId does not exist', () => {
      HTTP.adminQuizRemove({ token: token, quizid: quizId });

      quizIds.push(quizId + 1);
      const res = HTTP.adminQuizTrashEmpty({ token: token, quizIds: quizIds });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    describe('Valid token but quizId does not belong to the current user', () => {
      test('quiz in quizzes', () => {
        const resUser1 = HTTP.adminAuthRegister(INPUT_USER_2);
        const token2 = JSON.parse(resUser1.body.toString()).token;

        const res = HTTP.adminQuizTrashEmpty({ token: token2, quizIds: quizIds });
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(403);
      });

      test('quiz in trash', () => {
        const resUser1 = HTTP.adminAuthRegister(INPUT_USER_2);
        const token2 = JSON.parse(resUser1.body.toString()).token;

        const resQuiz1 = HTTP.adminQuizCreate({ token: token2, name: 'Quiz 1', description: 'Quiz to be deleted' });
        const quizId1 = JSON.parse(resQuiz1.body.toString()).quizId;
        HTTP.adminQuizRemove({ token: token, quizid: quizId1 });
        HTTP.adminQuizRemove({ token: token, quizid: quizId });

        quizIds.push(quizId1);
        const res = HTTP.adminQuizTrashEmpty({ token: token, quizIds: quizIds });
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(403);
      });
    });
  });

  describe('Functionality testing', () => {
    test('Has the correct return type', () => {
      HTTP.adminQuizRemove({ token: token, quizid: quizId });

      const res = HTTP.adminQuizTrashEmpty({ token: token, quizIds: quizIds });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('Succesfully deletes one quiz', () => {
      HTTP.adminQuizRemove({ token: token, quizid: quizId });
      HTTP.adminQuizTrashEmpty({ token: token, quizIds: quizIds });

      const res = HTTP.adminQuizTrashView({ token: token });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        quizzes: []
      });
    });
  });
});
