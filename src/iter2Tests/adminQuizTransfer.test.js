import { clear } from '../other';
import { adminQuizCreate, adminQuizInfo, adminQuizTransfer } from '../quiz';
import { adminAuthRegister } from '../auth';

const ERROR = expect.any(String);

beforeEach(() => {
  clear();
});

describe('adminQuizTransfer', () => {
  let authUser;
  let authUser2;
  let quiz;
  beforeEach(() => {
    authUser = adminAuthRegister('betty@unsw.com', 'password1', 'Betty', 'Boop');
    authUser2 = adminAuthRegister('norman@unsw.com', 'password1', 'Norman', 'Nile');
    quiz = adminQuizCreate(authUser.authUserId, 'Quiz1', 'Betty\'s quiz');
  });

  describe('error testing', () => {
    test('returns an error for an invalid target email', () => {
      expect(() => adminQuizTransfer(authUser.authUserId, quiz.quizId, 'notanemail@unsw.com')).toThrow(Error);
    });

    test('returns an error for the current user\'s email', () => {
      expect(() => adminQuizTransfer(authUser.authUserId, quiz.quizId, 'betty@unsw.com')).toThrow(Error);
    });

    test('returns an error for a quiz name already in use by the target', () => {
      adminQuizCreate(authUser2.authUserId, 'Quiz1', 'Norman\'s quiz');
      expect(() => adminQuizTransfer(authUser.authUserId, quiz.quizId, 'norman@unsw.com')).toThrow(Error);
    });

    test('returns an error for a quiz not owned by this user', () => {
      const quiz2 = adminQuizCreate(authUser2.authUserId, 'Quiz1', 'Norman\'s quiz');
      expect(() => adminQuizTransfer(authUser.authUserId, quiz2.quizId, 'norman@unsw.com')).toThrow(Error);
    });

    test('returns an error for an invalid authUserId', () => {
      expect(() => adminQuizTransfer(authUser.authUserId + 1, quiz.quizId, 'norman@unsw.com')).toThrow(Error);
    });

    test('returns an error for an invalid quizId', () => {
      expect(() => adminQuizTransfer(authUser.authUserId, quiz.quizId + 1, 'norman@unsw.com')).toThrow(Error);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      expect(adminQuizTransfer(authUser.authUserId, quiz.quizId, 'norman@unsw.com')).toStrictEqual({});
    });

    test('quiz is successfully transferred to target', () => {
      adminQuizTransfer(authUser.authUserId, quiz.quizId, 'norman@unsw.com');
      expect(adminQuizInfo(authUser2.authUserId, quiz.quizId)).toStrictEqual({
        quizId: quiz.quizId,
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
