import { clear } from './other';
import { adminAuthRegister, adminUserDetails } from './auth';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  // Reset state of data so tests can be run independently
  clear();
});

describe('adminUserDetails', () => {
  let authUser;
  beforeEach(() => {
    authUser = adminAuthRegister('betty@unsw.com', 'password1', 'Betty', 'Boop');
  });

  describe('error testing', () => {
    test('returns an error for invalid aut.authUserId', () => {
      expect(adminUserDetails(authUser.authUserId + 1)).toStrictEqual(ERROR);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      expect(adminUserDetails(authUser.authUserId)).toStrictEqual({
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
      expect(adminUserDetails(authUser.authUserId)).toStrictEqual({
        user: {
          userId: authUser.authUserId,
          name: 'Betty Boop',
          email: 'betty@unsw.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });

    test('correctly returns the user details of multiple users', () => {
      const authUser2 = adminAuthRegister('norman@unsw.com', 'password1', 'Norman', 'Nile');
      expect(adminUserDetails(authUser.authUserId)).toStrictEqual({
        user: {
          userId: authUser.authUserId,
          name: 'Betty Boop',
          email: 'betty@unsw.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
      expect(adminUserDetails(authUser2.authUserId)).toStrictEqual({
        user: {
          userId: authUser2.authUserId,
          name: 'Norman Nile',
          email: 'norman@unsw.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });
  });
});
