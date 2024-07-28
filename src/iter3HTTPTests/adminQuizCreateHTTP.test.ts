import * as HTTP from './HTTPHelper';

// CONSTANTS //
const ERROR = { error: expect.any(String) };

// TESTING //
beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('POST /v2/admin/quiz', () => {
  test('Token is non-existent', () => {
    const res = HTTP.adminQuizCreate({ token: '0', name: 'Betty boop quiz', description: 'Quiz for Betty boop' });
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

    test('Token is not a valid token', () => {
      const res1 = HTTP.adminQuizCreate({ token: token + 1, name: 'Betty boop quiz', description: 'Quiz for Betty boop' });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(401);
    });

    test.each([{
      name: 'He@rt quiz',
      description: 'Quiz for He@rt'
    },
    {
      name: 'He##rt quiz',
      description: 'Quiz for He##rt'
    },
    {
      name: 'H!@rt quiz',
      description: 'Quiz for H!@rt'
    },
    ])('name containing invalid characters "$name"', ({
      name,
      description
    }) => {
      const res1 = HTTP.adminQuizCreate({ token: token, name: name, description: description });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);
    });

    test.each([{
      name: 'He',
      description: 'Quiz for He'
    },
    {
      name: 'a'.repeat(31),
      description: 'a'.repeat(31)
    },
    ])('names that are of invalid length "$name"', ({
      name,
      description
    }) => {
      const res1 = HTTP.adminQuizCreate({ token: token, name: name, description: description });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);
    });

    test('name already used for another quiz', () => {
      HTTP.adminQuizCreate({ token: token, name: 'Betty boop quiz', description: 'Quiz for Betty boop' });
      const res1 = HTTP.adminQuizCreate({ token: token, name: 'Betty boop quiz', description: 'Quiz for Betty boop' });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);
    });

    test('description is more than 100 characters in length', () => {
      const res1 = HTTP.adminQuizCreate({ token: token, name: 'Betty boop quiz', description: `Quiz for Betty boop ${'a'.repeat(101)}` });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);
    });

    test('Correctly created a quiz', () => {
      const res1 = HTTP.adminQuizCreate({ token: token, name: 'Betty boop quiz', description: 'Quiz for Betty boop' });
      expect(JSON.parse(res1.body.toString())).toStrictEqual({
        quizId: expect.any(Number),
      });
    });

    test('Correctly created a quiz with empty description', () => {
      const res1 = HTTP.adminQuizCreate({ token: token, name: 'Betty boop quiz', description: '' });
      expect(JSON.parse(res1.body.toString())).toStrictEqual({
        quizId: expect.any(Number),
      });
    });
  });
});
