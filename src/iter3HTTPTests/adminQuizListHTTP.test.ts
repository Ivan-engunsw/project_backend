import * as HTTP from './HTTPHelper';
import { Quiz } from '../dataStore';

// CONSTANTS //
const ERROR = { error: expect.any(String) };

// TESTING //
beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('GET /v1/admin/quiz/list', () => {
  test('Token is non-existent', () => {
    const res = HTTP.adminQuizList({ token: '0' });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  describe('After creating tokens', () => {
    let token: string;
    beforeEach(() => {
      const res = HTTP.adminAuthRegister({
        email: 'bettyBoop@gmail.com',
        password: 'helloWorld1',
        nameFirst: 'Betty',
        nameLast: 'Boop'
      });
      token = JSON.parse(res.body.toString()).token;
    });

    test('Token is not a valid user', () => {
      const res = HTTP.adminQuizList({ token: token + 1 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Returning the correct details', () => {
      const res = HTTP.adminQuizList({ token: token });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        quizzes: []
      });
    });

    describe('After creating quizzes', () => {
      let quizId1: number;
      let quizDetails1: Quiz;
      beforeEach(() => {
        const res1 = HTTP.adminQuizCreate({ token: token, name: 'quiz 1', description: 'Mathematics Quiz' });
        quizId1 = JSON.parse(res1.body.toString()).quizId;
        const res2 = HTTP.adminQuizInfo({ token: token, quizid: quizId1 });
        quizDetails1 = JSON.parse(res2.body.toString());
      });

      test('Returning the correct details when one quiz is created', () => {
        const res = HTTP.adminQuizList({ token: token });
        expect(JSON.parse(res.body.toString())).toStrictEqual({
          quizzes: [{
            quizId: quizId1,
            name: quizDetails1.name,
          }]
        });
      });

      test('Returning the correct details when multiple quizzes is created', () => {
        const resQuiz2 = HTTP.adminQuizCreate({ token: token, name: 'quiz 2', description: 'English Quiz' });
        const quizId2 = JSON.parse(resQuiz2.body.toString()).quizId;
        const resQuizInfo2 = HTTP.adminQuizInfo({ token: token, quizid: quizId2 })
        const quizDetails2 = JSON.parse(resQuizInfo2.body.toString());

        const resUser2 = HTTP.adminAuthRegister({
          email: 'ronaldoSuiii@gmail.com',
          password: 'helloWorld5',
          nameFirst: 'Ronaldo',
          nameLast: 'Suiii'
        })
        const token2 = JSON.parse(resUser2.body.toString()).token;
        HTTP.adminQuizCreate({ token: token2, name: 'quiz 1', description: 'English Quiz' });

        const list1 = new Set();
        list1.add({
          quizId: quizId1,
          name: quizDetails1.name,
        });
        list1.add({
          quizId: quizId2,
          name: quizDetails2.name,
        });

        const list2 = new Set();
        const res = HTTP.adminQuizList({ token: token });
        const quizzes = JSON.parse(res.body.toString()).quizzes;
        for (const quiz of quizzes) {
          list2.add(quiz);
        }
        expect(list2).toStrictEqual(list1);
      });
    });
  });
});
