import {
    adminQuizList,
    adminQuizCreate,
    adminQuizInfo,
} from './quiz.js';

import { clear } from './other.js';

import { adminAuthRegister } from './auth.js'; 

const ERROR = { error: expect.any(String)};

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
            admin = adminAuthRegister('123456789@unsw.edu.au','hello','Betty','Boop');
        });

        test('AuthUserId is not a valid user', () => {
            expect(adminQuizList(admin.authUserId+1)).toStrictEqual(ERROR);
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
                quiz1 = adminQuizCreate(admin.authUserId,'quiz 1','Mathematics Quiz');
                quizDetails1 = adminQuizInfo(admin.authUserId,quiz1.quizId);
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
                let quiz2 = adminQuizCreate(admin.authUserId,'quiz 2','English Quiz');
                let quizDetails2 = adminQuizInfo(admin.authUserId,quiz2.quizId);
                let list1 = new Set();
                list1.add({
                    quizId: quiz1.quizId,
                    name: quizDetails1.name,
                });
                list1.add({
                    quizId: quiz2.quizId,
                    name: quizDetails2.name,
                });

                let list2 = new Set();
                let quizListVariable = adminQuizList(admin.authUserId).quizzes;
                for (let quizzes of quizListVariable) {
                    list2.add(quizzes);
                }
                expect(list2).toStrictEqual(list1);
            });
        });
    });

});