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

describe('POST /v2/admin/quiz/:quizid/restore', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const resUser = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(resUser.body.toString()).token;
    const resQuiz = HTTP.adminQuizCreate({ token: token, name: 'first', description: 'desc' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;
  });

  test('Quiz ID refers to a quiz that is not currently in the trash', () => {
    const res = HTTP.adminQuizRestore({ token: token, quizid: quizId });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Quiz name of the restored quiz is already used by another active quiz', () => {
    HTTP.adminQuizRemove({ token: token, quizid: quizId });
    HTTP.adminQuizCreate({ token: token, name: 'first', description: 'desc' });

    const res = HTTP.adminQuizRestore({ token: token, quizid: quizId });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid token', () => {
    HTTP.adminQuizRemove({ token: token, quizid: quizId });
    const res = HTTP.adminQuizRestore({ token: token + 1, quizid: quizId });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    HTTP.adminQuizRemove({ token: token, quizid: quizId });
    const res = HTTP.adminQuizRestore({ token: token, quizid: quizId + 1 });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const resUser2 = HTTP.adminAuthRegister({
      email: 'auth@two.com',
        password: 'authtwo2',
        nameFirst: 'auth',
        nameLast: 'two'
    })
    const token2 = JSON.parse(resUser2.body.toString()).token;

    HTTP.adminQuizRemove({ token: token, quizid: quizId });

    const res = HTTP.adminQuizRestore({ token: token2, quizid: quizId });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Correct return type', () => {
    HTTP.adminQuizRemove({ token: token, quizid: quizId });
    const res = HTTP.adminQuizRestore({ token: token, quizid: quizId });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
  });

  test('Successfully restore one quiz', () => {
    HTTP.adminQuizRemove({ token: token, quizid: quizId });

    const infoBef = HTTP.adminQuizList({ token: token });
    expect(JSON.parse(infoBef.body.toString()).quizzes).toStrictEqual([]);
    const trashBef = HTTP.adminQuizTrashView({ token: token });
    expect(JSON.parse(trashBef.body.toString()).quizzes).toStrictEqual(
      [
        {
          quizId: quizId,
          name: 'first'
        }
      ]
    );

    HTTP.adminQuizRestore({ token: token, quizid: quizId });

    const infoAft = HTTP.adminQuizList({ token: token });
    expect(JSON.parse(infoAft.body.toString()).quizzes).toStrictEqual(
      [
        {
          quizId: quizId,
          name: 'first'
        }
      ]
    );
    const trashAft = HTTP.adminQuizTrashView({ token: token });
    expect(JSON.parse(trashAft.body.toString()).quizzes).toStrictEqual([]);
  });

  test('Successfully restore multiple quizzes', () => {
    const resQuiz2 = HTTP.adminQuizCreate({ token: token, name: 'second', description: 'desc' });
    const quizId2 = JSON.parse(resQuiz2.body.toString()).quizId;

    HTTP.adminQuizRemove({ token: token, quizid: quizId });
    HTTP.adminQuizRemove({ token: token, quizid: quizId2 });

    const infoBef = HTTP.adminQuizList({ token: token });
    expect(JSON.parse(infoBef.body.toString()).quizzes).toStrictEqual([]);
    const trashBef = HTTP.adminQuizTrashView({ token: token });
    expect(JSON.parse(trashBef.body.toString()).quizzes).toStrictEqual([{
      quizId: quizId,
      name: 'first'
    }, {
      quizId: quizId2,
      name: 'second'
    }]);

    HTTP.adminQuizRestore({ token: token, quizid: quizId });
    HTTP.adminQuizRestore({ token: token, quizid: quizId2 });

    const infoAft = HTTP.adminQuizList({ token: token });
    expect(JSON.parse(infoAft.body.toString()).quizzes).toStrictEqual([{
      quizId: quizId,
      name: 'first'
    }, {
      quizId: quizId2,
      name: 'second'
    }]);
    const trashAft = HTTP.adminQuizTrashView({ token: token });
    expect(JSON.parse(trashAft.body.toString()).quizzes).toStrictEqual([]);
  });
});
