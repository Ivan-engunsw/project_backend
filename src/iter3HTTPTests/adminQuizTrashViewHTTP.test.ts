import * as HTTP from './HTTPHelper';

// CONSTANTS //
const INPUT_USER = {
  email: 'betty@unsw.com',
  password: 'password1',
  nameFirst: 'Betty',
  nameLast: 'Boop'
};
const ERROR = { error: expect.any(String) };

// TESTING //
beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('GET /v2/admin/quiz/trash', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const resUser = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(resUser.body.toString()).token;
    const resQuiz = HTTP.adminQuizCreate({ token: token, name: 'first', description: 'desc' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;
  });

  test('Invalid token', () => {
    const res = HTTP.adminQuizTrashView({ token: token + 1 });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Correct return type', () => {
    const res = HTTP.adminQuizTrashView({ token: token });
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      quizzes: []
    });
  });

  test('Successfully view one deleted quiz', () => {
    HTTP.adminQuizRemove({ token: token, quizid: quizId });

    const res = HTTP.adminQuizTrashView({ token: token });
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      quizzes: [{
        name: 'first',
        quizId: quizId
      }]
    });
  });

  test('Successfully view multiple deleted quizzes', () => {
    const resUser2 = HTTP.adminAuthRegister({
      email: 'auth@two.com',
      password: 'authtw02',
      nameFirst: 'auth',
      nameLast: 'two'
    });
    const token2 = JSON.parse(resUser2.body.toString()).token;

    const resQuiz2 = HTTP.adminQuizCreate({ token: token2, name: 'second', description: 'desc' });
    const quizId2 = JSON.parse(resQuiz2.body.toString()).quizId;

    const resQuiz3 = HTTP.adminQuizCreate({ token: token2, name: 'third', description: 'desc' });
    const quizId3 = JSON.parse(resQuiz3.body.toString()).quizId;

    HTTP.adminQuizRemove({ token: token, quizid: quizId });
    HTTP.adminQuizRemove({ token: token2, quizid: quizId2 });
    HTTP.adminQuizRemove({ token: token2, quizid: quizId3 });

    const res = HTTP.adminQuizTrashView({ token: token2 });
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      quizzes: [
        {
          name: 'second',
          quizId: quizId2,
        },
        {
          name: 'third',
          quizId: quizId3,
        }
      ]
    });
  });
});
