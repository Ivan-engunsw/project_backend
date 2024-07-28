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

describe('PUT /v1/admin/user/details', () => {
  let token: string;
  beforeEach(() => {
    const res = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(res.body.toString()).token;
  });

  test('Successfully updates user details', () => {
    const res1 = HTTP.adminUserDetailsUpdate({
      token: token,
      email: 'Updatedemail@gmail.com',
      nameFirst: 'Bratty',
      nameLast: 'Dorp',
    });
    expect(JSON.parse(res1.body.toString())).toStrictEqual({});

    const res2 = HTTP.adminUserDetails({ token: token });
    const userDetails = JSON.parse(res2.body.toString());
    expect(userDetails).toMatchObject({
      user: {
        email: 'Updatedemail@gmail.com',
        name: 'Bratty Dorp',
      }
    });
  });

  describe('Error Testing', () => {
    test('Case when token is not valid', () => {
      const res = HTTP.adminUserDetailsUpdate({
        token: token + 1,
        email: 'Updatedemail@gmail.com',
        nameFirst: 'Bratty',
        nameLast: 'Dorp',
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Case when email is invalid', () => {
      const res = HTTP.adminUserDetailsUpdate({
        token: token,
        email: 'invalid-email',
        nameFirst: 'Bratty',
        nameLast: 'Dorp',
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when email is used by another user', () => {
      HTTP.adminAuthRegister({
        email: 'anotheremail@gmail.com',
        password: '1234zyx#@',
        nameFirst: 'Jane',
        nameLast: 'Dorp'
      });

      const res = HTTP.adminUserDetailsUpdate({
        token: token,
        email: 'anotheremail@gmail.com',
        nameFirst: 'Bratty',
        nameLast: 'Dorp',
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test.each([
      {
        nameFirst: 'Br@tty'
      },
      {
        nameFirst: 'Br55TTy'
      },
    ])('Case when nameFirst contains invalid characters', ({
      nameFirst
    }) => {
      const res = HTTP.adminUserDetailsUpdate({
        token: token,
        email: 'Updatedemail@gmail.com',
        nameFirst: nameFirst,
        nameLast: 'Dorp',
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when nameFirst is less than 2 characters', () => {
      const res = HTTP.adminUserDetailsUpdate({
        token: token,
        email: 'Updatedemail@gmail.com',
        nameFirst: 'B',
        nameLast: 'Dorp',
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when nameFirst is more than 20 characters', () => {
      const res = HTTP.adminUserDetailsUpdate({
        token: token,
        email: 'Updatedemail@gmail.com',
        nameFirst: 'B'.repeat(21),
        nameLast: 'Dorp',
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test.each([{
      nameLast: 'Do@p'
    },
    {
      nameLast: 'D3op'
    },
    ])('Case when nameLast contains invalid characters', ({
      nameLast
    }) => {
      const res = HTTP.adminUserDetailsUpdate({
        token: token,
        email: 'Updatedemail@gmail.com',
        nameFirst: 'Bratty',
        nameLast: nameLast,
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when nameLast is less than 2 characters', () => {
      const res = HTTP.adminUserDetailsUpdate({
        token: token,
        email: 'Updatedemail@gmail.com',
        nameFirst: 'Bratty',
        nameLast: 'D',
      });

      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when nameLast is more than 20 characters', () => {
      const res = HTTP.adminUserDetailsUpdate({
        token: token,
        email: 'Updatedemail@gmail.com',
        nameFirst: 'Bratty',
        nameLast: 'D'.repeat(21),
      });

      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });
  });
});
