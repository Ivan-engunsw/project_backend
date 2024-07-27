import * as HTTP from './HTTPHelper';

// CONSTANTS //
const INPUT_USER = {
  email: 'originalemail@gmail.com',
  password: '1234zyx#@',
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

describe('PUT /v2/admin/user/password', () => {
  let token: string;
  beforeEach(() => {
    const res = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(res.body.toString()).token;
  });

  test('Successfully updates the password', () => {
    const res1 = HTTP.adminUserPasswordUpdate({ 
      token: token, 
      oldPassword: '1234zyx#@', 
      newPassword: 'newpass1' 
    });
    expect(JSON.parse(res1.body.toString())).toStrictEqual({});

    const res2 = HTTP.adminAuthLogin({ email: 'originalemail@gmail.com', password: 'newpass1' });
    const loginResponse = JSON.parse(res2.body.toString());
    expect(loginResponse).toHaveProperty('token');
  });

  describe('Error Testing', () => {
    test('Case when token is not valid', () => {
      const res = HTTP.adminUserPasswordUpdate({ 
        token: token + 1, 
        oldPassword: '1234zyx#@', 
        newPassword: 'newpass1' 
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Case when old password is incorrect', () => {
      const res = HTTP.adminUserPasswordUpdate({ 
        token: token, 
        oldPassword: 'wrongpassword', 
        newPassword: 'newpass1' 
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when old and new passwords match', () => {
      const res = HTTP.adminUserPasswordUpdate({ 
        token: token, 
        oldPassword: '1234zyx#@', 
        newPassword: '1234zyx#@' 
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when new password has already been used before', () => {
      HTTP.adminUserPasswordUpdate({ 
        token: token, 
        oldPassword: '1234zyx#@', 
        newPassword: 'newpass1' 
      });

      const res = HTTP.adminUserPasswordUpdate({ 
        token: token, 
        oldPassword: 'newpass1', 
        newPassword: '1234zyx#@' 
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when new password is less than 8 characters', () => {
      const res = HTTP.adminUserPasswordUpdate({ 
        token: token, 
        oldPassword: '1234zyx#@', 
        newPassword: 'short1' 
      });

      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when new password does not contain at least one number and one letter', () => {
      const res2 = HTTP.adminUserPasswordUpdate({ 
        token: token, 
        oldPassword: '1234zyx#@', 
        newPassword: 'abcdefgh' 
      });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });
  });
});
