import { adminQuizCreate } from './quiz.js';

import { clear } from './other.js';

import { adminAuthRegister } from './auth.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
});

describe('adminQuizCreate', () => {
  test('AuthUserId is non-existent', () => {
    expect(adminQuizCreate(1, 'Betty boop quiz', 'Quiz for Betty boop')).toStrictEqual(ERROR);
  });

  describe('After creating authorised users', () => {
    let admin;
    beforeEach(() => {
      admin = adminAuthRegister('bettyBoop@gmail.com', 'helloWorld1', 'Betty', 'Boop');
    });

    test('AuthUserId is not a valid user', () => {
      expect(adminQuizCreate(admin.authUserId + 1, 'Betty boop quiz', 'Quiz for Betty boop')).toStrictEqual(ERROR);
    });

    test.each([
      { name: 'He@rt quiz', description: 'Quiz for He@rt' },
      { name: 'He##rt quiz', description: 'Quiz for He##rt' },
      { name: 'H!@rt quiz', description: 'Quiz for H!@rt' },
    ])('name containing invalid characters "$name"', ({ name, description }) => {
      expect(adminQuizCreate(admin.authUserId, name, description)).toStrictEqual(ERROR);
    });

    test.each([
      { name: 'He', description: 'Quiz for He' },
      { name: 'a'.repeat(31), description: 'a'.repeat(31) },
    ])('names that are of invalid length "$name"', ({ name, description }) => {
      expect(adminQuizCreate(admin.authUserId, name, description)).toStrictEqual(ERROR);
    });

    test('name already used for another quiz', () => {
      adminQuizCreate(admin.authUserId, 'Betty boop quiz', 'Quiz for Betty boop');
      expect(adminQuizCreate(admin.authUserId, 'Betty boop quiz', 'Quiz for Betty boop')).toStrictEqual(ERROR);
    });

    test('description is more than 100 characters in length', () => {
      expect(adminQuizCreate(admin.authUserId, 'Betty boop quiz',
                `Quiz for Betty boop ${'a'.repeat(101)}`)).toStrictEqual(ERROR);
    });

    test('Correctly created a quiz', () => {
      expect(adminQuizCreate(admin.authUserId, 'Betty boop quiz', 'Quiz for Betty boop')).toStrictEqual(
        {
          quizId: expect.any(Number),
        }
      );
    });

    test('Correctly created a quiz with empty description', () => {
      expect(adminQuizCreate(admin.authUserId, 'Betty boop quiz', '')).toStrictEqual(
        {
          quizId: expect.any(Number),
        }
      );
    });
  });
});
