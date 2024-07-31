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

describe('DELETE /v2/admin/quiz/:quizid', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const resUser = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(resUser.body.toString()).token;
    const resQuiz = HTTP.adminQuizCreate({ token: token, name: 'first', description: 'desc' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;
  });

  test('Session not in END state', () => {
    const inputQuestion = {
      question: 'Who is the Monarch of England?',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
    HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3 });

    const res = HTTP.adminQuizRemove({ token: token, quizid: quizId });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  })

  test('Invalid token', () => {
    const res = HTTP.adminQuizRemove({ token: token + 1, quizid: quizId });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const res = HTTP.adminQuizRemove({ token: token, quizid: quizId + 1 });
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

    const res = HTTP.adminQuizRemove({ token: token2, quizid: quizId });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Correct return type', () => {
    const res = HTTP.adminQuizRemove({ token: token, quizid: quizId });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
  });

  test('Successfully delete one quiz', () => {
    HTTP.adminQuizRemove({ token: token, quizid: quizId });

    const res = HTTP.adminQuizCreate({ token: token, name: 'first', description: 'desc' });
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      quizId: expect.any(Number)
    });

    const trash = HTTP.adminQuizTrashView({ token: token });
    expect(JSON.parse(trash.body.toString())).toStrictEqual({
      quizzes: [
        {
          name: 'first',
          quizId: quizId
        }]
    });
  });

  test('Successfully delete multiple quizzes', () => {
    HTTP.adminQuizRemove({ token: token, quizid: quizId });

    const res1 = HTTP.adminQuizCreate({ token: token, name: 'first', description: 'desc' });
    expect(JSON.parse(res1.body.toString())).toStrictEqual({
      quizId: expect.any(Number)
    });

    const resQuiz2 = HTTP.adminQuizCreate({ token: token, name: 'second', description: 'desc' });
    const quizId2 = JSON.parse(resQuiz2.body.toString()).quizId;

    HTTP.adminQuizRemove({ token: token, quizid: quizId2 });

    const res2 = HTTP.adminQuizCreate({ token: token, name: 'second', description: 'desc' });
    expect(JSON.parse(res2.body.toString())).toStrictEqual({
      quizId: expect.any(Number)
    });

    const trash = HTTP.adminQuizTrashView({ token: token });
    expect(JSON.parse(trash.body.toString())).toStrictEqual({
      quizzes: [
        {
          name: 'first',
          quizId: quizId
        }, {
          name: 'second',
          quizId: quizId2,
        }
      ]
    });
  });
});
