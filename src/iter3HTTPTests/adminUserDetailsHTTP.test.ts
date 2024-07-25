import * as HTTP from './HTTPHelper';

// CONSTANTS //
const INPUT_USER = {
  email: 'betty@unsw.com',
  password: 'password1',
  nameFirst: 'Betty',
  nameLast: 'Boop'
};
const ERROR = { error: expect.any(String) };

// TESTING //
beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('GET /v1/admin/user/details', () => {
  let token: string;
  beforeEach(() => {
    const res = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(res.body.toString()).token;
  });

  describe('error testing', () => {
    test('returns an error for invalid token', () => {
      const res = HTTP.adminUserDetails({ token: token + 1 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = HTTP.adminUserDetails({ token: token });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });

    test('correctly returns the user details of 1 user', () => {
      const res = HTTP.adminUserDetails({ token: token });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Betty Boop',
          email: 'betty@unsw.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });

    test('correctly returns the user details of multiple users', () => {
      const inputUser2 = {
        email: 'norman@unsw.com',
        password: 'password1',
        nameFirst: 'Norman',
        nameLast: 'Nile'
      };
      const user2 = HTTP.adminAuthRegister(inputUser2);
      const token2 = JSON.parse(user2.body.toString()).token;

      const res = HTTP.adminUserDetails({ token: token });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Betty Boop',
          email: 'betty@unsw.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });

      const res2 = HTTP.adminUserDetails({ token: token2 });
      expect(JSON.parse(res2.body.toString())).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Norman Nile',
          email: 'norman@unsw.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });
  });
});
