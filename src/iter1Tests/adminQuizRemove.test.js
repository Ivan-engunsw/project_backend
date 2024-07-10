import { adminQuizCreate, adminQuizRemove } from '../quiz';
import { adminAuthRegister } from '../auth';
import { clear } from '../other';

const ERROR = { errorMsg: expect.any(String), errorCode: expect.any(Number) };

describe('adminQuizRemove', () => {
  let authUserId1, authUserId2, quizId1, quizId2, quizId3;
  beforeEach(() => {
    clear();
    authUserId1 = adminAuthRegister('auth@one.com', 'authone1', 'auth', 'one').authUserId;
    authUserId2 = adminAuthRegister('auth@two.com', 'authtwo2', 'auth', 'two').authUserId;
    quizId1 = adminQuizCreate(authUserId1, 'first', 'desc').quizId;
    quizId2 = adminQuizCreate(authUserId1, 'second', 'desc').quizId;
    quizId3 = adminQuizCreate(authUserId2, 'third', 'desc').quizId;
  });

  test('AuthUserId is not a valid user', () => {
    expect(adminQuizRemove('', quizId1)).toStrictEqual(ERROR);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    expect(adminQuizRemove(authUserId1, '')).toStrictEqual(ERROR);
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    expect(adminQuizRemove(authUserId1, quizId3)).toStrictEqual(ERROR);
  });

  test('Correct return type', () => {
    expect(adminQuizRemove(authUserId1, quizId1)).toStrictEqual({});
  });

  test('Successfully delete one quiz', () => {
    adminQuizRemove(authUserId1, quizId1);
    expect(adminQuizCreate(authUserId1, 'first', 'desc').quizId).toStrictEqual(expect.any(Number));
  });

  test('Successfully delete multiple quizzes', () => {
    adminQuizRemove(authUserId1, quizId1);
    expect(adminQuizCreate(authUserId1, 'first', 'desc').quizId).toStrictEqual(expect.any(Number));

    adminQuizRemove(authUserId1, quizId2);
    expect(adminQuizCreate(authUserId1, 'second', 'desc').quizId).toStrictEqual(expect.any(Number));
  });
});
