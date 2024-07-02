import { clear } from './other.js';
import { adminQuizCreate, adminQuizInfo, adminQuizDescriptionUpdate } from './quiz';
import { adminAuthRegister } from './auth';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  // Reset state of data so tests can be run independently
  clear();
});

describe('adminQuizDescriptionUpdate', () => {
  let authUser;
  let quiz;
  beforeEach(() => {
    authUser = adminAuthRegister('betty@unsw.com', 'password1', 'Betty', 'Boop');
    quiz = adminQuizCreate(authUser.authUserId, 'Quiz1', 'Betty\'s quiz');
  });

  describe('error testing', () => {
    test('returns an error for a description that is too long', () => {
      const veryLongString = '10charlong :)'.repeat(10);
      expect(adminQuizDescriptionUpdate(authUser.authUserId, quiz.quizId, veryLongString)).toStrictEqual(ERROR);
    });

    test('returns an error for invalid authUserId', () => {
      expect(adminQuizDescriptionUpdate(authUser.authUserId + 1, quiz.quizId, 'Norman\'s quiz')).toStrictEqual(ERROR);
    });

    test('returns an error for invalid quizId', () => {
      expect(adminQuizDescriptionUpdate(authUser.authUserId, quiz.quizId + 1, 'Norman\'s quiz')).toStrictEqual(ERROR);
    });

    test('returns an error for a quiz not owned by this user', () => {
      const authUser2 = adminAuthRegister('norman@unsw.com', 'password1', 'Norman', 'Nile');
      const quiz2 = adminQuizCreate(authUser2.authUserId, 'Quiz2', 'Norman\'s quiz');
      expect(adminQuizDescriptionUpdate(authUser.authUserId, quiz2.quizId, 'Betty\'s quiz')).toStrictEqual(ERROR);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      expect(adminQuizDescriptionUpdate(authUser.authUserId, quiz.quizId, 'Norman\'s quiz')).toStrictEqual({ });
    });

    test('correctly returns for an empty string', () => {
      const emptyString = '';
      expect(adminQuizDescriptionUpdate(authUser.authUserId, quiz.quizId, emptyString)).toStrictEqual({ });
    });

    test('successfully updates the description of a quiz', () => {
      adminQuizDescriptionUpdate(authUser.authUserId, quiz.quizId, 'Norman\'s quiz');
      expect(adminQuizInfo(authUser.authUserId, quiz.quizId)).toStrictEqual(
        {
          quizId: quiz.quizId,
          name: 'Quiz1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Norman\'s quiz',
        }
      );
    });

    test('successfully updates the dscription of multiple quizzes', () => {
      const quiz2 = adminQuizCreate(authUser.authUserId, 'Quiz2', 'Description2');
      adminQuizDescriptionUpdate(authUser.authUserId, quiz.quizId, 'New description1');
      adminQuizDescriptionUpdate(authUser.authUserId, quiz2.quizId, 'New description2');
      expect(adminQuizInfo(authUser.authUserId, quiz.quizId)).toStrictEqual(
        {
          quizId: quiz.quizId,
          name: 'Quiz1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'New description1',
        }
      );

      expect(adminQuizInfo(authUser.authUserId, quiz2.quizId)).toStrictEqual(
        {
          quizId: quiz2.quizId,
          name: 'Quiz2',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'New description2',
        }
      );
    });
  });
});
