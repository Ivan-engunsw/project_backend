import { adminQuizList, adminQuizCreate, adminQuizInfo } from '../quiz';

import { adminAuthRegister } from '../auth';
import { clear } from '../other';

const ERROR = { errorMsg: expect.any(String), errorCode: expect.any(Number) };

beforeEach(() => {
  clear();
});

describe('adminQuizList', () => {
  test('AuthUserId is non-existent', () => {
    expect(adminQuizList(1)).toStrictEqual(ERROR);
  });

  describe('After creating authorised users', () => {
    let admin;
    beforeEach(() => {
      admin = adminAuthRegister('bettyBoop@gmail.com', 'helloWorld1', 'Betty', 'Boop');
    });

    test('AuthUserId is not a valid user', () => {
      expect(adminQuizList(admin.authUserId + 1)).toStrictEqual(ERROR);
    });

    test('Returning the correct details', () => {
      expect(adminQuizList(admin.authUserId)).toStrictEqual({
        quizzes: []
      });
    });

    describe('After creating quizzes', () => {
      let quiz1;
      let quizDetails1;
      beforeEach(() => {
        quiz1 = adminQuizCreate(admin.authUserId, 'quiz 1', 'Mathematics Quiz');
        quizDetails1 = adminQuizInfo(admin.authUserId, quiz1.quizId);
      });
      test('Returning the correct details when one quiz is created', () => {
        expect(adminQuizList(admin.authUserId)).toStrictEqual({
          quizzes: [
            {
              quizId: quiz1.quizId,
              name: quizDetails1.name,
            }
          ]
        });
      });

      test('Returning the correct details when multiple quizzes is created', () => {
        const quiz2 = adminQuizCreate(admin.authUserId, 'quiz 2', 'English Quiz');
        const quizDetails2 = adminQuizInfo(admin.authUserId, quiz2.quizId);
        const admin2 = adminAuthRegister('ronaldoSuiii@gmail.com', 'helloWorld5', 'Ronaldo', 'Suiii');
        adminQuizCreate(admin2.authUserId, 'quiz 1', 'English Quiz');
        const list1 = new Set();
        list1.add({
          quizId: quiz1.quizId,
          name: quizDetails1.name,
        });
        list1.add({
          quizId: quiz2.quizId,
          name: quizDetails2.name,
        });

        const list2 = new Set();
        const quizListVariable = adminQuizList(admin.authUserId).quizzes;
        for (const quizzes of quizListVariable) {
          list2.add(quizzes);
        }
        expect(list2).toStrictEqual(list1);
      });
    });
  });
});
