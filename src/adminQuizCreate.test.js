import {adminQuizCreate} from './quiz.js';

import { clear } from './other.js';

import { adminAuthRegister } from './auth.js'; 

const ERROR = { error: expect.any(String)};

beforeEach(() => {
    clear();
});

describe('adminQuizCreate', () => {
    test('AuthUserId is non-existent', () => {
        expect(adminQuizCreate(1,'Betty boop quiz','Quiz for Betty boop')).toStrictEqual(ERROR);
    });

    describe('After creating authorised users', () => {
        let admin;
        beforeEach(() => {
            admin = adminAuthRegister('123456789@unsw.edu.au','hello','Betty','Boop');
        });

        test('AuthUserId is not a valid user', () => {
            expect(adminQuizCreate(admin.authUserId+1,'Betty boop quiz','Quiz for Betty boop')).toStrictEqual(ERROR);
        });

        test.each([
            {authUserId: admin.authUserId, name: 'He@rt quiz', description: 'Quiz for He@rt'},
            {authUserId: admin.authUserId, name: 'He##rt quiz', description: 'Quiz for He##rt'},
            {authUserId: admin.authUserId, name: 'H!@rt quiz', description: 'Quiz for H!@rt'},
        ])('name containing invalid characters "$name"', (authUserId,name,description) => {
            expect(adminQuizCreate(authUserId,name,description)).toStrictEqual(ERROR);
        });

        test.each([
            {authUserId: admin.authUserId, name: 'He', description: 'Quiz for He'},
            {authUserId: admin.authUserId, name: 'asdfghjkloiuytrewqzxcvbnmpoiuyt', description: 'Quiz for asdfghjkloiuytrewqzxcvbnmpoiuyt'},
        ])('names that are of invalid length "$name"', (authUserId,name,description) => {
            expect(adminQuizCreate(authUserId,name,description)).toStrictEqual(ERROR);
        });

        test('name already used for another quiz', () => {
            adminQuizCreate(admin.authUserId,'Betty boop quiz','Quiz for Betty boop');
            expect(adminQuizCreate(admin.authUserId,'Betty boop quiz','Quiz for Betty boop')).toStrictEqual(ERROR);
        });

        test('description is more than 100 characters in length', () => {
            expect(adminQuizCreate(admin.authUserId,'Betty boop quiz',
                'Quiz for Betty boop alfjskladjflksadfjklsajfskladfjskldjfjsdjfjskaldfjjasfklsajfjsasdfjksadfksajfklskjdhfkjsajkdfjksadklfshadfkljskldafklaskjdfjklsadjfksjafjl')).toStrictEqual(ERROR);
        });

        test('Correctly created a quiz', () => {
            expect(adminQuizCreate(admin.authUserId,'Betty boop quiz','Quiz for Betty boop')).toStrictEqual(
                {
                    quizId: expect.any(Number),
                }   
            );
        });

        test('Correctly created a quiz with empty description', () => {
            expect(adminQuizCreate(admin.authUserId,'Betty boop quiz','')).toStrictEqual(
                {
                    quizId: expect.any(Number),
                }   
            );
        });
    });
});