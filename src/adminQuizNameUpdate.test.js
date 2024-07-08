import { clear } from './other';
import { adminQuizList, adminQuizCreate, adminQuizInfo, adminQuizNameUpdate } from './quiz';
import { adminAuthRegister } from './auth';

const ERROR = { error: expect.any(String), errorCode: expect.any(Number) };
beforeEach(() => {
  // Reset state of data so tests can be run independently
  clear();
});

describe('adminQuizNameUpdate', () => {
  let authUser;
  let quiz;
  beforeEach(() => {
    authUser = adminAuthRegister('betty@unsw.com', 'password1', 'Betty', 'Boop');
    quiz = adminQuizCreate(authUser.authUserId, 'Quiz1', 'Betty\'s quiz');
  });

  describe('error testing', () => {
    test.each([
      { name: '' },
      { name: '12' },
      { name: 'ab' },
      { name: 'abcdefghijklmnopqrstuvwxyz123456' },
      { name: '@!#$&#)$)*#$*__!@(**@' },
    ])('returns an error for invalid names', ({ name }) => {
      expect(adminQuizNameUpdate(authUser.authUserId, quiz.quizId, name)).toStrictEqual(ERROR);
    });

    test('returns an error for name already in use', () => {
      adminQuizCreate(authUser.authUserId, 'Quiz2', 'Norman\'s quiz');
      expect(adminQuizNameUpdate(authUser.authUserId, quiz.quizId, 'Quiz2')).toStrictEqual(ERROR);
    });

    test('returns an error for invalid authUserId', () => {
      expect(adminQuizNameUpdate(authUser.authUserId + 1, quiz.quizId, 'New quiz1')).toStrictEqual(ERROR);
    });

    test('returns an error for invalid quizId', () => {
      expect(adminQuizNameUpdate(authUser.authUserId, quiz.quizId + 1, 'New quiz1')).toStrictEqual(ERROR);
    });

    test('returns an error for a quiz not owned by this user', () => {
      const authUser2 = adminAuthRegister('norman@unsw.com', 'password1', 'Norman', 'Nile');
      const quiz2 = adminQuizCreate(authUser2.authUserId, 'Quiz2', 'Norman\'s quiz');
      expect(adminQuizNameUpdate(authUser.authUserId, quiz2.quizId, 'New quiz1')).toStrictEqual(ERROR);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      expect(adminQuizNameUpdate(authUser.authUserId, quiz.quizId, 'New quiz1')).toStrictEqual({ });
    });

    test('successfully updates the name of a quiz', () => {
      adminQuizNameUpdate(authUser.authUserId, quiz.quizId, 'New quiz1');
      expect(adminQuizInfo(authUser.authUserId, quiz.quizId)).toStrictEqual(
        {
          quizId: quiz.quizId,
          name: 'New quiz1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Betty\'s quiz',
        }
      );
    });

    test('successfully updates the name of multiple quizzes', () => {
      const quiz2 = adminQuizCreate(authUser.authUserId, 'Quiz2', 'Norman\'s quiz');
      adminQuizNameUpdate(authUser.authUserId, quiz.quizId, 'New quiz1');
      adminQuizNameUpdate(authUser.authUserId, quiz2.quizId, 'New quiz2');
      expect(adminQuizList(authUser.authUserId)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'New quiz1',
          },
          {
            quizId: quiz2.quizId,
            name: 'New quiz2',
          },
        ]
      });
    });
  });
});
