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

describe('POST /v2/admin/auth/logout', () => {
  let token: string;
  beforeEach(() => {
    const res = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(res.body.toString()).token;
  });

  describe('error testing', () => {
    test('returns an error for invalid token', () => {
      const res = HTTP.adminAuthLogout({ token: token + 1 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = HTTP.adminAuthLogout({ token: token });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('token is successfully removed', () => {
      HTTP.adminAuthLogout({ token: token });
      const res = HTTP.adminAuthLogout({ token: token });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('successfully logouts multiple users', () => {
      const inputUser2 = {
        email: 'norman@unsw.com',
        password: 'password1',
        nameFirst: 'Norman',
        nameLast: 'Nile'
      };
      const user2 = HTTP.adminAuthRegister(inputUser2);
      const token2 = JSON.parse(user2.body.toString()).token;

      const res1 = HTTP.adminAuthLogout({ token: token });
      expect(JSON.parse(res1.body.toString())).toStrictEqual({});

      const res2 = HTTP.adminAuthLogout({ token: token2 });
      expect(JSON.parse(res2.body.toString())).toStrictEqual({});
    });
  });
});
